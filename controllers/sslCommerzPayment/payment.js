const SSLCommerz = require("sslcommerz-lts");

function SslCommerzPayment(store_id, store_passwd, live = false) {
  live = String(live) === "true" ? true : false;
  const sslcommerz = new SSLCommerz(store_id, store_passwd, live);
  console.log(`Payment Mode = > ${live ? "Production" : "Development"}`);
  function init(data) {
    return sslcommerz.init(data);
  }

  function validate(data) {
    return sslcommerz.validate(data);
  }

  function initiateRefund(data) {
    return sslcommerz.initiateRefund({
      refund_amount: data.refund_amount,
      refund_remarks: data.refund_remarks,
      bank_tran_id: data.bank_tran_id,
      refe_id: data.refe_id,
    });
  }

  function refundQuery(data) {
    return sslcommerz.refundQuery(data);
  }

  function transactionQueryBySessionId(data) {
    return sslcommerz.transactionQueryBySessionId({
      sessionkey: data?.sessionkey,
    });
  }

  function transactionQueryByTransactionId(data) {
    return sslcommerz.transactionQueryByTransactionId({
      tran_id: data?.tran_id,
    });
  }

  return {
    init,
    validate,
    initiateRefund,
    refundQuery,
    transactionQueryBySessionId,
    transactionQueryByTransactionId,
  };
}

module.exports = SslCommerzPayment;
