const axios = require('axios');

module.exports = config => {
  const axiosConfig = {
    auth: {
      username: config.username,
      password: config.apiKey,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const get = path => axios.get(`${config.url}${path}`, axiosConfig);
  post = (path, data, options = {}) =>
    axios.post(
      `${config.url}${path}`,
      data,
      Object.assign(axiosConfig, options),
    );

  const cursor = (path, selector, items = []) => {
    return axios.get(path, axiosConfig).then(({ data }) => {
      items = [...items, ...selector(data)];

      const next = data.next;
      return next ? cursor(next, selector, items) : items;
    });
  };
  const orders = () =>
    cursor(`${config.url}/orders/`, d => d.results);

  return {
    orders,
    pendingOrders: () => orders().then(r => r.filter(o => !o.marked)),
    markOrders: ids =>
      post('/orders/marked/', {
        orders: ids.map(id => ({
          id: id,
          marked: true,
        })),
      }),
    packages: packages => post('/packages/', { packages }),
    deliveryNote: order =>
      post(
        '/delivery_notes/',
        { orders: [{ order }] },
        {
          responseType: 'arraybuffer',
        },
      ).then(response => response.data),
  };
};
