// Приведенный ниже блок ifdef - это стандартный метод создания макросов, упрощающий процедуру 
// экспорта из библиотек DLL. Все файлы данной DLL скомпилированы с использованием символа POSAPI_EXPORTS,
// в командной строке. Этот символ не должен быть определен в каком-либо проекте
// использующем данную DLL. Благодаря этому любой другой проект, чьи исходные файлы включают данный файл, видит 
// функции POSAPI_API как импортированные из DLL, тогда как данная DLL видит символы,
// определяемые данным макросом, как экспортированные.
#ifdef POSAPI_EXPORTS
#define POSAPI_API __declspec(dllexport)
#else
#define POSAPI_API __declspec(dllimport)
#endif

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */

POSAPI_API typedef void * POS_HANDLE;
extern POSAPI_API const POS_HANDLE POS_NONE;

// Available actions.
extern POSAPI_API const int ACTION_BREAK;
extern POSAPI_API const int ACTION_TEST;
extern POSAPI_API const int ACTION_STATUS;
extern POSAPI_API const int ACTION_REVISION;
extern POSAPI_API const int ACTION_HOST_ECHO_TEST;

extern POSAPI_API const int ACTION_CASH;
extern POSAPI_API const int ACTION_DEPOSIT;
extern POSAPI_API const int ACTION_PAYMENT;
extern POSAPI_API const int ACTION_REVERSAL;
extern POSAPI_API const int ACTION_RETURN;
extern POSAPI_API const int ACTION_PREAUTH;
extern POSAPI_API const int ACTION_COMPLETE;
extern POSAPI_API const int ACTION_PARTIAL_REVERSAL;
extern POSAPI_API const int ACTION_CREDIT_VOUCHER;

extern POSAPI_API const int ACTION_BALANCE;
extern POSAPI_API const int ACTION_CLOSE_DAY;
extern POSAPI_API const int ACTION_REPORT;
extern POSAPI_API const int ACTION_COPY_RECEIPT;
extern POSAPI_API const int ACTION_COPY_CLOSE_DAY;
extern POSAPI_API const int ACTION_READ_CARD;
extern POSAPI_API const int ACTION_GET_VERIF_CODE;
extern POSAPI_API const int ACTION_CARD_VERIFICATION;
extern POSAPI_API const int ACTION_CHANGE_VERIF_CODE;

extern POSAPI_API const int ACTION_FUEL_PAYMENT;
extern POSAPI_API const int ACTION_FUEL_REVERSAL;
extern POSAPI_API const int ACTION_FUEL_RETURN;
extern POSAPI_API const int ACTION_FUEL_PIN_RETURN;
extern POSAPI_API const int ACTION_FUEL_PREAUTH;
extern POSAPI_API const int ACTION_FUEL_COMPLETE;
extern POSAPI_API const int ACTION_FUEL_VOICE_AUTH;
extern POSAPI_API const int ACTION_FUEL_COUPON_PAYMENT;
extern POSAPI_API const int ACTION_FUEL_COUPON_VOICE_AUTH;

extern POSAPI_API const int ACTION_PRINT_DATA;
extern POSAPI_API const int ACTION_SHOW_QR_CODE;

// Available responses.
extern POSAPI_API const int RESP_ERROR;
extern POSAPI_API const int RESP_TIMEOUT;
extern POSAPI_API const int RESP_BREAK;
extern POSAPI_API const int RESP_CONFIRM;
extern POSAPI_API const int RESP_DECLINE;
extern POSAPI_API const int RESP_MESSAGE;
extern POSAPI_API const int RESP_INPUT;
extern POSAPI_API const int RESP_IDENTIFIER;
extern POSAPI_API const int RESP_KEEPALIVE;

// Available error codes.
extern POSAPI_API const int ERR_NONE;
extern POSAPI_API const int ERR_FAILURE;

// Available parameters.
extern POSAPI_API const char *POS_AMOUNT;
extern POSAPI_API const char *POS_CURRENCY;
extern POSAPI_API const char *POS_PROFILE;
extern POSAPI_API const char *POS_TRANS_ID;
extern POSAPI_API const char *POS_TRANS_CODE;
extern POSAPI_API const char *POS_TRANS_APPROVAL;
extern POSAPI_API const char *POS_TRANS_STATUS;
extern POSAPI_API const char *POS_TRANS_ACTION;
extern POSAPI_API const char *POS_TRANS_MSGCODE;

extern POSAPI_API const char *POS_DATE_TIME;
extern POSAPI_API const char *POS_CARD_PAN;
extern POSAPI_API const char *POS_CARD_EXPIRY;
extern POSAPI_API const char *POS_CARD_HOLDER;
extern POSAPI_API const char *POS_MSG_TITLE;
extern POSAPI_API const char *POS_MSG_BODY;
extern POSAPI_API const char *POS_MSG_BREAK;
extern POSAPI_API const char *POS_STATUS;

extern POSAPI_API const char *POS_GOODS_ID;
extern POSAPI_API const char *POS_GOODS_NAME;
extern POSAPI_API const char *POS_GOODS_QUANTITY;
extern POSAPI_API const char *POS_GOODS_PRICE;
extern POSAPI_API const char *POS_GOODS_AMOUNT;
extern POSAPI_API const char *POS_ADD_GOODS;
extern POSAPI_API const char *POS_GOODS_RESP_CODE;
extern POSAPI_API const char *POS_GOODS_RESP_DATA;
extern POSAPI_API const char *POS_GOODS_DISCOUNT;

extern POSAPI_API const char *POS_TRANS_RECEIPT;
extern POSAPI_API const char *POS_REVISION_SIGN;
extern POSAPI_API const char *POS_CARD_TRACK1;
extern POSAPI_API const char *POS_CARD_TRACK2;
extern POSAPI_API const char *POS_CARD_TRACK3;
extern POSAPI_API const char *POS_REPORT;

extern POSAPI_API const char *POS_ORIG_AMOUNT;
extern POSAPI_API const char *POS_CARD_PAYMENT;

extern POSAPI_API const char *POS_CARD_VERIF_CODE;
extern POSAPI_API const char *POS_CARD_NEW_VERIF_CODE;
extern POSAPI_API const char *POS_ENCRYPTION_SIGN;

extern POSAPI_API const char *POS_PRINT_DATA;
extern POSAPI_API const char *POS_CARD_ID_NUMBER;

extern POSAPI_API const char *POS_CARD_CVV2;
extern POSAPI_API const char *POS_PRINT_RECEIPT;

extern POSAPI_API const char *POS_BEFORE_PRINT;
extern POSAPI_API const char *POS_CARD_LOYALTY_CODE;

extern POSAPI_API const char *POS_CARD_PAN_SHA256;
extern POSAPI_API const char *POS_TIPS;
extern POSAPI_API const char *POS_MERCHANT_ID;
extern POSAPI_API const char *POS_TERMINAL_ID;

extern POSAPI_API const char *POS_DATA;
extern POSAPI_API const char *POS_TIMEOUT;
extern POSAPI_API const char *POS_OPTION;

// Available methods.
POSAPI_API bool pos_open_with_timeout(POS_HANDLE *handle_p, const char *name, int timeout, const char *log);
POSAPI_API bool pos_open(POS_HANDLE *handle_p, const char *name, const char *log);
POSAPI_API bool pos_close(POS_HANDLE *handle_p);

POSAPI_API bool pos_send(POS_HANDLE handle, int action);
POSAPI_API int  pos_receive(POS_HANDLE handle, int timeout);

POSAPI_API bool pos_set(POS_HANDLE handle, const char *param, const char *val);
POSAPI_API bool pos_get(POS_HANDLE handle, const char *param, char *val, int val_size);

POSAPI_API bool pos_get_first(POS_HANDLE handle, char *param, int param_size, char *val, int val_size);
POSAPI_API bool pos_get_next(POS_HANDLE handle, char *param, int param_size, char *val, int val_size);

POSAPI_API int  pos_error(POS_HANDLE handle);

POSAPI_API int pos_get_length(POS_HANDLE handle, const char *param);
POSAPI_API int pos_get_max_length(POS_HANDLE handle);

#ifdef __cplusplus
}; /* extern "C" */
#endif /* __cplusplus */
