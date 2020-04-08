const OngoingClient = require('./lib/ongoingClient');
const createFyndiq = require('./lib/fyndiqClient');
const createLogClient = require('./lib/slackClient');

const sync = async (
  description,
  fyndiqSettings,
  ongoingSettings,
  slackSettings,
) => {
  const logger = createLogClient(slackSettings);
  const fyndiq = createFyndiq(fyndiqSettings);
  const ongoing = new OngoingClient(
    ongoingSettings.apiUrl,
    ongoingSettings.goodsOwnerId,
    ongoingSettings.username,
    ongoingSettings.password,
  );

  logger.log(description);
  const [fyndiqOrders, ongoingOrders] = await Promise.all([
    fyndiq.pendingOrders(),
    ongoing.pendingOrders(),
  ]);

  if (!fyndiqOrders.length) {
    logger.log('There are no pending Fyndiq orders');
    await logger.print();
    return;
  }

  await Promise.all(
    fyndiqOrders
      .map(fo => ({
        sid: `${fo.id}${fyndiqSettings.suffix}`.trim(),
        ...fo,
      }))
      .map(fo => {
        const ongoingOrder = ongoingOrders.find(
          oo => oo.orderNumber === fo.sid,
        );
        if (ongoingOrder) fo.ongoingId = ongoingOrder.orderId;
        return fo;
      })
      .filter(fo => fo.ongoingId)
      .map(order => {
        const filename = `Fyndiq.${order.sid}.pdf`;
        return ongoing.orderFiles(order.ongoingId).then(files => {
          if (files.some(file => file.fileName === filename)) {
            logger.log(`Order ${order.OrderId} HAS file ${fileName}`);
            return Promise.resolve();
          }
          return fyndiq
            .deliveryNote(order.id)
            .then(pdfData =>
              ongoing.uploadDeliveryNote(
                order.ongoingId,
                filename,
                pdfData,
              ),
            )
            .then(() =>
              logger.log(
                `Uploaded ${fileName} to order ${order.OrderId}`,
              ),
            );
        });
      }),
  );

  await logger.print();
};

module.exports = sync;
