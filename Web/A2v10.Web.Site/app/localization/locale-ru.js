﻿// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20240118-7967
// locale-ru.js

"use strict";

(function () {

	window.$$locale = {
		$Locale: 'ru-RU',
		$DateLocale: 'ru-RU',
		$NumberLocale: 'ru-RU',
		$Ok: 'OK',
		$Cancel: 'Отмена',
		$Close: 'Закрыть',
		$Apply: 'Применить',
		$Back: 'Назад',
		$Next: 'Далее',
		$Finish: 'Готово',
		$Tasks: 'Задачи',
		$Quit: 'Выход',
		$Save: 'Сохранить',
		$NotSave: 'Не сохранять',
		$Refresh: 'Обновить',
		$Confirm: 'Подтверждение',
		$Message: 'Сообщение',
		$Error: 'Ошибка',
		$Help: 'Помощь',
		$ConfirmClose: 'Подтверждение закрытия',
		$MakeValidFirst: 'Сначала исправьте ошибки',
		$ElementWasChanged: 'Элемент был изменен. Сохранить изменения?',
		$Profiling: 'Профилирование',
		$DataModel: 'Модель данных',
		$Admin: 'администратор',
		$Today: 'Сегодня',
		$Yesterday: 'Вчера',
		$Week: 'Неделя',
		$Month: 'Месяц',
		$CreateLC: 'создать',
		$NoElements: 'нет элементов',
		$PagerElements: 'элементы',
		$Of: 'из',
		$Register: 'Регистрация',
		$ClickToDownloadPicture: 'Щелкните чтобы загрузить картинку',
		$ClickToDownloadFile: 'Щелкните чтобы загрузить файл',
		$EnterPassword: 'Введите пароль',
		$MatchError: 'Пароль не совпадает с подтверждением',
		$PasswordLength: 'Пароль должен иметь длину не менее 6 символов',
		$PasswordAgain: 'Пароль еще раз',
		$InvalidOldPassword: 'Неправильний старый пароль',
		$ChangePasswordNotAllowed: 'Смена пароля запрещена',
		$ChangePasswordSuccess: 'Пароль изменен успешно',
		$ChangePassword: 'Сменить пароль',
		$Last7Days: 'Последние 7 дней',
		$Last30Days: 'Последние 30 дней',
		$MonthToDate: 'C начала месяца',
		$PrevMonth: 'Предыдущий месяц',
		$CurrMonth: 'Текущий месяц',
		$QuartToDate: 'C начала квартала',
		$PrevQuart: 'Предыдущий квартал',
		$CurrQuart: 'Текущий квартал',
		$YearToDate: 'C начала года',
		$AllPeriodData: 'За все время',
		$CurrYear: 'Текущий год',
		$PrevYear: 'Предыдущий год',
		$CustomPeriod: 'Произвольно',
		$Hours: 'Часы',
		$Minutes: 'Минуты',
		$License: 'лицензия',
		$HomePage: 'домашняя страница',
		$CreatedOpenSource: 'Создано с использованием программного обеспечения с открытым исходным кодом',
		$Unknown: 'Не указано',
		$ChooseFile: 'Выберите файл',
		$AccessDenied: 'Доступ к системе запрещен!',
		$PermissionDenied: 'Доступ запрещен!',
		$FileTooLarge: 'Файл слишком большой. Размер файла должен быть не более {0} KB',
		$DesktopNotSupported: 'Это действие не поддерживается в настольной версии',
		$Settings: 'Настройка',
		$Feedback: 'Обратная связь',
		$PreviewIsUnavailable: 'Preview is unavailable for this file',
		$ShowSpecProps: 'Показать все свойства'
	};

	if (window.d3) {
		d3.formatDefaultLocale({
			decimal: ",",
			thousands: "\xa0",
			grouping: [3],
			currency: ["\u20BD", ""]
		});

		d3.timeFormatDefaultLocale({
			"dateTime": "%A, %e %B %Y г. %X",
			"date": "%d.%m.%Y",
			"time": "%H:%M:%S",
			"periods": ["AM", "PM"],
			"days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
			"shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
			"months": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
			"shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
		});
	}
})();