// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

// 20250913-7984
// locale-bg.js

"use strict";

(function () {

	window.$$locale = {
		$Locale: 'bg-BG',
		$Ok: 'OK',
		$Cancel: 'Отказ',
		$Close: 'Затвори',
		$Apply: 'Приложи',
		$Back: 'Назад',
		$Next: 'Напред',
		$Finish: 'Готово',
		$Tasks: 'Задачи',
		$Quit: 'Изход',
		$Save: 'Запази',
		$NotSave: 'Не запазвай',
		$Refresh: 'Опресни',
		$Confirm: 'Потвърждение',
		$Message: 'Съобщение',
		$Error: 'Грешка',
		$Help: 'Помощ',
		$ConfirmClose: 'Потвърждение за затваряне',
		$MakeValidFirst: 'Първо коригирайте грешките',
		$ElementWasChanged: 'Елементът е променен. Да запазя промените?',
		$Profiling: 'Профилиране',
		$DataModel: 'Модел на данните',
		$Admin: 'администратор',
		$Today: 'Днес',
		$Yesterday: 'Вчера',
		$CreateLC: 'създай',
		$NoElements: 'няма елементи',
		$PagerElements: 'елементи',
		$Of: 'от',
		$Register: 'Регистрация',
		$ClickToDownloadPicture: 'Щракнете, за да изтеглите изображение',
		$ClickToDownloadFile: 'Щракнете, за да изтеглите файл',
		$EnterPassword: 'Въведете парола',
		$MatchError: 'Паролата не съвпада с потвърждението',
		$PasswordLength: 'Паролата трябва да е поне 6 символа',
		$InvalidOldPassword: 'Невалидна стара парола',
		$ChangePasswordNotAllowed: 'Смяната на паролата е забранена',
		$ChangePasswordSuccess: 'Паролата е променена успешно',
		$ChangePassword: 'Смени парола',
		$Last7Days: 'Последните 7 дни',
		$Last30Days: 'Последните 30 дни',
		$MonthToDate: 'От началото на месеца',
		$PrevMonth: 'Предходен месец',
		$CurrMonth: 'Текущ месец',
		$QuartToDate: 'От началото на тримесечието',
		$PrevQuart: 'Предходно тримесечие',
		$CurrQuart: 'Текущо тримесечие',
		$YearToDate: 'От началото на годината',
		$AllPeriodData: 'За целия период',
		$CurrYear: 'Текуща година',
		$PrevYear: 'Предходна година',
		$CustomPeriod: 'Произволен период',
		$Hours: 'Часове',
		$Minutes: 'Минути',
		$License: 'лиценз',
		$HomePage: 'начална страница',
		$CreatedOpenSource: 'Създадено с използване на софтуер с отворен код',
		$Unknown: 'Не е посочено',
		$ChooseFile: 'Изберете файл',
		$AccessDenied: 'Достъп до системата е отказан!',
		$PermissionDenied: 'Достъп отказан!',
		$FileTooLarge: 'Файлът е твърде голям. Размерът трябва да е не повече от {0} KB',
		$DesktopNotSupported: 'Това действие не се поддържа в настолната версия',
		$Settings: 'Настройки',
		$Feedback: 'Обратна връзка',
		$PreviewIsUnavailable: 'Preview is unavailable for this file',
		$ShowSpecProps: 'Show special properties',
		$Search: 'Търсене'
	};

	if (window.d3) {
		d3.formatDefaultLocale({
			decimal: ",",
			thousands: "\xa0",
			grouping: [3],
			// валута: суфикс " лв." след числото (напр. 10,00 лв.)
			currency: ["", " лв."]
		});

		d3.timeFormatDefaultLocale({
			"dateTime": "%A, %e %B %Y г. %X",
			"date": "%d.%m.%Y",
			"time": "%H:%M:%S",
			"periods": ["AM", "PM"],
			"days": ["неделя", "понеделник", "вторник", "сряда", "четвъртък", "петък", "събота"],
			"shortDays": ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
			"months": ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"],
			"shortMonths": ["ян", "фев", "мар", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"]
		});
	}
})();
