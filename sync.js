const OngoingClient = require('./lib/ongoingClient');
const createFyndiq = require('./lib/fyndiqClient');
const createLogClient = require('./lib/slackClient');

const handleOrder = async (logger, cdonClient, ongoingClient) => {
  const fileName = `CDON.${order.OrderId}.pdf`;
  const files = await ongoingClient.orderFiles(order.OngoingId);

  if (hasFile(files, fileName)) {
    logger.log(`Order ${order.OrderId} HAS file ${fileName}`);
  } else {
    logger.log(
      `Order ${order.OrderId} DOES NOT have file ${fileName}`,
    );
    const pdfData = await cdonClient.deliveryNote(order);
    await ongoingClient.uploadDeliveryNote(
      order.OngoingId,
      fileName,
      pdfData,
    );
    logger.log(`Uploaded ${fileName} to order ${order.OrderId}`);
  }
};

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
        return ongoing
          .orderFiles(order.ongoingId)
          .then(files =>
            files.some(file => file.fileName === filename)
              ? Promise.resolve()
              : fyndiq
                  .deliveryNote(order.id)
                  .then(pdfData =>
                    ongoing.uploadDeliveryNote(
                      order.ongoingId,
                      filename,
                      pdfData,
                    ),
                  ),
          );
      }),
  );

  await logger.print();
};

module.exports = sync;
