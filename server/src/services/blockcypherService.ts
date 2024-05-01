async function retrieveWalletInfo(address: string) {
  try {
    return await fetch(
      'https://api.blockcypher.com/v1/btc/test3/addrs/' + address + '/full',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log(res);
        return res;
      });
  } catch (err) {
    throw err;
  }
}

export { retrieveWalletInfo };
