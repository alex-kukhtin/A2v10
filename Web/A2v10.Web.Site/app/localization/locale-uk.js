﻿// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20240118-7967
// locale-uk.js

"use strict";

(function () {

	window.$$locale = {
		$Locale: 'uk-UA',
		$DateLocale: 'uk-UA',
		$NumberLocale: 'uk-UA',
		$Ok: 'OK',
		$Cancel: 'Скасувати',
		$Close: 'Закрити',
		$Apply: 'Застосувати',
		$Back: 'Назад',
		$Next: 'Далі',
		$Finish: 'Готово',
		$Tasks: 'Задачі',
		$Quit: 'Вихід',
		$Save: 'Зберегти',
		$NotSave: 'Не зберігати',
		$Refresh: 'Оновити',
		$Confirm: 'Підтвердження',
		$Error: 'Помилка',
		$Message: 'Повідомлення',
		$Help: 'Допомога',
		$ConfirmClose: 'Підтвердження закриття',
		$MakeValidFirst: 'Спочатку виправте помилки',
		$ElementWasChanged: 'Елемент було змінено. Зберегти зміни?',
		$Profiling: 'Профілювання',
		$DataModel: 'Модель даних',
		$Admin: 'адміністратор',
		$Today: 'Сьогодні',
		$Week: 'Тиждень',
		$Month: 'Місяць',
		$Yesterday: 'Вчора',
		$CreateLC: 'cтворити',
		$NoElements: 'немає елементів',
		$PagerElements: 'елементи',
		$Of: 'з',
		$Register: 'Реєстрація',
		$ClickToDownloadPicture: 'Клацніть щоб завантажити картинку',
		$ClickToDownloadFile: 'Перетягніть сюди файл для завантаження або клацніть щоб вибрати',
		$EnterPassword: 'Введіть пароль',
		$MatchError: 'Пароль та підтвердження не співпадають',
		$PasswordLength: 'Пароль має містити принаймні 6 символів',
		$PasswordAgain: 'Пароль ще раз',
		$InvalidOldPassword: 'Неправильний старий пароль',
		$ChangePasswordNotAllowed: 'Зміну пароля заборонено',
		$ChangePasswordSuccess: 'Пароль змінено вдало',
		$ChangePassword: 'Змінити пароль',
		$Last7Days: 'Останні 7 днів',
		$Last30Days: 'Останні 30 днів',
		$MonthToDate: 'З початку місяця',
		$PrevMonth: 'Попередній місяць',
		$CurrMonth: 'Поточний місяць',
		$QuartToDate: 'З початку квартала',
		$PrevQuart: 'Попередній квартал',
		$CurrQuart: 'Поточний квартал',
		$YearToDate: 'З початку року',
		$CurrYear: 'Поточний рік',
		$PrevYear: 'Попередній рік',
		$AllPeriodData: 'За весь час',
		$CustomPeriod: 'Довільно',
		$Hours: 'Години',
		$Minutes: 'Хвилини',
		$License: 'ліцензія',
		$HomePage: 'домашня сторінка',
		$CreatedOpenSource: 'Створено з використанням програмного забезпечення з відкритим сирцевим кодом',
		$Unknown: 'Не вказано',
		$ChooseFile: 'Оберіть файл',
		$AccessDenied: 'Доступ до системи заборонено!',
		$PermissionDenied: 'Доступ заборонено!',
		$FileTooLarge: 'Файл занадто великий. Розмір файлу не повинен перевищувати {0} KB',
		$DesktopNotSupported: 'Ця операція не підтримується в настільній версії',
		$Settings:'Налаштування',
		$Feedback: 'Зворотній зв\'язок',
		$PreviewIsUnavailable: 'Для цього файлу попередній перегляд неможливий',
		$ShowSpecProps: 'Показати спеціальні властивості'
	};

	if (window.d3) {
		d3.formatDefaultLocale({
			decimal: ",",
			thousands: "\xa0",
			grouping: [3],
			currency: ["\u20B4", ""]
		});

		d3.timeFormatDefaultLocale({
			"dateTime": "%A, %e %B %Y р. %X",
			"date": "%d.%m.%Y",
			"time": "%H:%M:%S",
			"periods": ["AM", "PM"],
			"days": ["неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота"],
			"shortDays": ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
			"months": ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"],
			"shortMonths": ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"]
		});
	}
})();
