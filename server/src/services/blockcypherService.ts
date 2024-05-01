async function retrieveWalletInfo(address: string) {
  try {
    return await fetch(
      "https://api.blockcypher.com/v1/btc/test3/addrs/" + address,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.status === 429)
          throw new Error("Too many requests, please try again later!");
        return res.json();
      })
      .then((res) => {
        return res;
      });
  } catch (err) {
    throw err;
  }
}

export { retrieveWalletInfo };
