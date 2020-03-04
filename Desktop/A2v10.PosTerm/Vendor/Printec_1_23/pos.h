#ifndef POS_H
#define POS_H

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */

/** Device descriptor. */
typedef void * POS_HANDLE;
extern const POS_HANDLE POS_NONE;


/** Available actions. */
extern const int ACTION_BREAK;
extern const int ACTION_TEST;
extern const int ACTION_STATUS;
extern const int ACTION_REVISION;
extern const int ACTION_HOST_ECHO_TEST;

extern const int ACTION_CASH;
extern const int ACTION_DEPOSIT;
extern const int ACTION_PAYMENT;
extern const int ACTION_REVERSAL;
extern const int ACTION_RETURN;
extern const int ACTION_PREAUTH;
extern const int ACTION_COMPLETE;
extern const int ACTION_PARTIAL_REVERSAL;
extern const int ACTION_CREDIT_VOUCHER;

extern const int ACTION_BALANCE;
extern const int ACTION_CLOSE_DAY;
extern const int ACTION_REPORT;
extern const int ACTION_COPY_RECEIPT;
extern const int ACTION_COPY_CLOSE_DAY;
extern const int ACTION_READ_CARD;
extern const int ACTION_GET_VERIF_CODE;
extern const int ACTION_CARD_VERIFICATION;
extern const int ACTION_CHANGE_VERIF_CODE;

extern const int ACTION_FUEL_PAYMENT;
extern const int ACTION_FUEL_REVERSAL;
extern const int ACTION_FUEL_RETURN;
extern const int ACTION_FUEL_PIN_RETURN;
extern const int ACTION_FUEL_PREAUTH;
extern const int ACTION_FUEL_COMPLETE;
extern const int ACTION_FUEL_VOICE_AUTH;
extern const int ACTION_FUEL_COUPON_PAYMENT;
extern const int ACTION_FUEL_COUPON_VOICE_AUTH;

extern const int ACTION_PRINT_DATA;
extern const int ACTION_SHOW_QR_CODE;

/** Available responses. */
extern const int RESP_ERROR;
extern const int RESP_TIMEOUT;
extern const int RESP_BREAK;
extern const int RESP_CONFIRM;
extern const int RESP_DECLINE;
extern const int RESP_MESSAGE;
extern const int RESP_INPUT;
extern const int RESP_KEEPALIVE;

extern const int RESP_IDENTIFIER;

/** Available error codes. */
extern const int ERR_NONE;
extern const int ERR_FAILURE;

/** Available parameters. */
extern const char *POS_AMOUNT;
extern const char *POS_CURRENCY;
extern const char *POS_PROFILE;
extern const char *POS_TRANS_ID;
extern const char *POS_TRANS_CODE;
extern const char *POS_TRANS_APPROVAL;
extern const char *POS_TRANS_STATUS;
extern const char *POS_TRANS_ACTION;
extern const char *POS_TRANS_MSGCODE;

extern const char *POS_DATE_TIME;
extern const char *POS_CARD_PAN;
extern const char *POS_CARD_EXPIRY;
extern const char *POS_CARD_HOLDER;
extern const char *POS_MSG_TITLE;
extern const char *POS_MSG_BODY;
extern const char *POS_MSG_BREAK;
extern const char *POS_PRINT;
extern const char *POS_STATUS;

extern const char *POS_GOODS_ID;
extern const char *POS_GOODS_NAME;
extern const char *POS_GOODS_QUANTITY;
extern const char *POS_GOODS_PRICE;
extern const char *POS_GOODS_AMOUNT;
extern const char *POS_ADD_GOODS; 

extern const char *POS_TRANS_RECEIPT;
extern const char *POS_REVISION_SIGN;
extern const char *POS_CARD_TRACK1;
extern const char *POS_CARD_TRACK2;
extern const char *POS_CARD_TRACK3;
extern const char *POS_REPORT;

extern const char *POS_GOODS_RESP_CODE;
extern const char *POS_GOODS_RESP_DATA;

extern const char *POS_GOODS_DISCOUNT;
extern const char *POS_ORIG_AMOUNT;
extern const char *POS_CARD_PAYMENT;

extern const char *POS_CARD_VERIF_CODE;
extern const char *POS_CARD_NEW_VERIF_CODE;
extern const char *POS_ENCRYPTION_SIGN;

extern const char *POS_PRINT_DATA;
extern const char *POS_CARD_ID_NUMBER;

extern const char *POS_CARD_CVV2;
extern const char *POS_PRINT_RECEIPT;

extern const char *POS_BEFORE_PRINT;
extern const char *POS_CARD_LOYALTY_CODE;

extern const char *POS_CARD_PAN_SHA256;
extern const char *POS_TIPS;
extern const char *POS_MERCHANT_ID;
extern const char *POS_TERMINAL_ID;

extern const char *POS_DATA;
extern const char *POS_TIMEOUT;
extern const char *POS_OPTION;

/** Available methods. */
extern bool pos_open_with_timeout(POS_HANDLE *handle_p, const char *name, int timeout, const char *log);
extern bool pos_open(POS_HANDLE *handle_p, const char *name, const char *log);
extern bool pos_close(POS_HANDLE *handle_p);

extern bool pos_send(POS_HANDLE handle, int action);
extern int pos_receive(POS_HANDLE handle, int timeout);

extern bool pos_set(POS_HANDLE handle, const char *param, const char *val);
extern bool pos_get(POS_HANDLE handle, const char *param, char *val, int val_size);

extern bool pos_get_first(POS_HANDLE handle, char *param, int param_size, char *val, int val_size);
extern bool pos_get_next(POS_HANDLE handle, char *param, int param_size, char *val, int val_size);

extern int pos_error(POS_HANDLE handle);

extern int pos_get_length(POS_HANDLE handle, const char *param);
extern int pos_get_max_length(POS_HANDLE handle);

#ifdef __cplusplus
}; /* extern "C" */
#endif /* __cplusplus */

#endif /* POS_H */
