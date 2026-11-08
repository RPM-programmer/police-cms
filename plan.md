ФИНАЛЬНЫЙ АРХИТЕКТУРНЫЙ ПЛАН БАЗЫ ДАННЫХ (POLICE-CMS)

--------------------------------------------------------------------------------
1. ЕДИНЫЙ РЕГИСТР ГРАЖДАН (models/uregistry/)
--------------------------------------------------------------------------------
* user.js (Граждане)
  - id: String, Primary Key (UID гражданина)
  - name: String, Allow Null: false (Имя)
  - surname: String, Allow Null: false (Фамилия)
  - patronymic: String (Отчество)
  - gmail: String (Почта)
  - phone: String (Телефон)
  - home: String (Адрес прописки / связь с моделью Home)
  - work: String (Место работы / связь с моделью Work)
  - role: String, Default: 'гражданин' ('гражданин' / 'admin')
  - passportId: String (PID паспорта / связь с Passport)

* passports.js (Паспортный стол)
  - sid: String, Primary Key (ID бланка)
  - uid: String (UID гражданина)
  - pid: String (Номер паспорта / пароль для авторизации)
  - name: String
  - surname: String
  - surname2: String
  - wasBorn: String
  - gender: String
  - region: String
  - photoUrl: String (Ссылка на фото/аватар для ориентировок)
  - auth: Boolean, Default: false (Активирован ли паспорт)

* homes.js (Реестр недвижимости)
  - id: String, Primary Key
  - city: String, Allow Null: false
  - street: String, Allow Null: false
  - house: String, Allow Null: false
  - purpose: String (Жилой дом, Школа, Больница, Офис, Отдел ГАИ и т.д.)

* works.js (Организации)
  - id: String, Primary Key
  - name: String, Allow Null: false (Название предприятия / ведомства)
  - address: String (Фактический адрес организации)

--------------------------------------------------------------------------------
2. ГОСУДАРСТВЕННАЯ АВТОИНСПЕКЦИЯ (models/tpolice/)
--------------------------------------------------------------------------------
* workers.js (Сотрудники ГАИ)
  - id: Integer, Primary Key, AutoIncrement
  - userId: String (Связы с User)
  - badgeNumber: String (Номер жетона)
  - rank: String (Звание: рядовой, лейтенант, капитан)
  - position: String ('gai_officer' / 'gai_boss')
  - patrolCar: String (Номер закрепленной машины)
  - patrolZone: String (Назначенная зона патрулирования)
  - bankAccountId: String (Номер счета для выплаты зарплаты)

* cars.js (База транспорта)
  - number: String, Primary Key (Госномер машины)
  - owner_name: String, Allow Null: false (ФИО владельца)
  - owner_phone: String
  - owner_gmail: String

* fines.js (Журнал штрафов)
  - id: Integer, Primary Key, AutoIncrement
  - carNumber: String (Связь с Car)
  - ouwner: String, Allow Null: false (ФИО нарушителя)
  - date: String, Allow Null: false
  - time: String, Allow Null: false
  - violation: String, Allow Null: false
  - punishment_type: String ('Штраф', 'Лишение прав', 'Арест авто')
  - punishment_value: String (Сумма штрафа или срок)
  - collaborator: String, Allow Null: false (ФИО и жетон сотрудника)
  - status: String, Default: 'Не выплачен' ('Не выплачен' / 'Выплачен')

* fine-standart.js (КоАП для ГАИ)
  - violation_code: String, Primary Key (Пример: '12.9.1')
  - violation_name: String, Allow Null: false
  - punishment_type: String, Allow Null: false
  - punishment_value: String, Allow Null: false

* rooms.js (Инфраструктура)
  - id: String, Primary Key
  - name: String, Allow Null: false
  - address: String, Allow Null: false

* evacuations.js (Штрафстоянка)
  - id: Integer, Primary Key, AutoIncrement
  - carNumber: String (Какая машина эвакуирована)
  - reason: String (Причина эвакуации)
  - parkingId: String (На какую штрафстоянку из Room увезли)
  - officerName: String (Кто оформил)

--------------------------------------------------------------------------------
3. ПРОСТАЯ МИЛИЦИЯ (models/militsiya/)
--------------------------------------------------------------------------------
* workers.js (Сотрудники Милиции)
  - id: Integer, Primary Key, AutoIncrement
  - userId: String (Связь с User)
  - badge: String (Жетон)
  - rank: String (Звание)
  - department: String ('ППС', 'УГРО', 'Дежурная часть')
  - position: String ('mil_officer', 'mil_detective', 'mil_boss')
  - weapon: String (Закрепленное оружие)
  - bankAccountId: String

* calls.js (Журнал вызовов «102 через сайт»)
  - id: Integer, Primary Key, AutoIncrement
  - callerId: String (Кто вызвал / связь с User)
  - callerPhone: String
  - address: String (Куда ехать)
  - description: Text (Что произошло)
  - status: String ('В обработке', 'Выезд наряда', 'Закрыт')
  - assignedOfficer: String (ФИО сотрудника, принявшего вызов)

* protocols.js (Административные протоколы)
  - id: Integer, Primary Key, AutoIncrement
  - offenderId: String (Нарушитель / связь с User)
  - article: String (Статья нарушения)
  - penalty: String (Штраф или наказание)
  - officer: String (Кто выписал)

* arrests.js (ИВС / Камера содержания)
  - id: Integer, Primary Key, AutoIncrement
  - detaineeId: String (Задержанный / связь с User)
  - reason: Text (Причина задержания)
  - timeIn: String (Когда посадили)
  - timeOut: String (Когда освободить)
  - belongings: Text (Сданные вещи на хранение)

* orientations.js (Ориентировки и Розыск)
  - id: Integer, Primary Key, AutoIncrement
  - targetUserId: String (Кого ищут / связь с User для JOIN фото паспорта)
  - reason: Text (За что объявлен в розыск)
  - dangerLevel: String ('Низкий', 'Средний', 'Особо опасен')
  - status: String ('В розыске', 'Пойман')

--------------------------------------------------------------------------------
4. ДЕПАРТАМЕНТ ОХРАНЫ (models/security_guard/)
--------------------------------------------------------------------------------
* workers.js (Сотрудники Охраны)
  - id: Integer, Primary Key, AutoIncrement
  - userId: String (Связь с User)
  - rank: String
  - position: String ('guard_officer', 'guard_boss')
  - bankAccountId: String
  - assignedPost: String (Охраняемый пост из objects)

* contracts.js (Договоры на охрану через сайт)
  - id: Integer, Primary Key, AutoIncrement
  - clientId: String (Владелец жилья или бизнеса / связь с User)
  - address: String (Объект под охрану)
  - cost: Integer (Стоимость в месяц)
  - status: String ('На рассмотрении', 'Активен', 'Расторгнут')

* objects.js (Охраняемые объекты)
  - id: Integer, Primary Key, AutoIncrement
  - contractId: Integer (Связь с Contract)
  - address: String
  - alarmSystemStatus: String ('Снято с охраны', 'На охране')

* alarms.js (Лог сработок и кнопки «Паника»)
  - id: Integer, Primary Key, AutoIncrement
  - objectId: Integer (Связь с Object)
  - triggerTime: String
  - type: String ('Датчик движения', 'Кнопка ПАНИКА')
  - status: String ('Тревога', 'Группа Выехала', 'Ложный вызов', 'Задержание')

--------------------------------------------------------------------------------
5. МИНИСТЕРСТВО ЮСТИЦИИ / СУД (models/court/)
--------------------------------------------------------------------------------
* workers.js (Судьи и приставы): id, userId, rank, position ('judge', 'court_clerk'), licenseNumber, bankAccountId
* courts.js (Судебные участки): id, iname, address
* history.js (Судебные дела): id, plaintiff, defendant (связь с User), info, date, time
* solutions.js (Приговоры): id, caseId (связь с History), verdict ('Виновен'/'Оправдан'), sentence, status

--------------------------------------------------------------------------------
6. КОМИТЕТ ГОСУДАРСТВЕННОЙ БЕЗОПАСНОСТИ (models/sequrity/)
--------------------------------------------------------------------------------
* workers.js (Агенты КГБ): id, userId, callsign, clearanceLevel, position ('kgb_agent', 'kgb_boss'), bankAccountId
* affairs.js (Уголовные дела КГБ): id, name, accusation, responsibleAgent, status ('Открыто'/'Закрыто')
* suspects.js (База наблюдения): id, affairId, citizenId (User), status, wiretapData
* searches.js (Ордера): id, affairId, targetAddress, type ('Обыск', 'Арест'), signedBy, status

--------------------------------------------------------------------------------
7. НАЦИОНАЛЬНАЯ ПОГРАНИЧНАЯ СЛУЖБА (models/border/)
--------------------------------------------------------------------------------
* workers.js (Пограничники): id, userId, rank, position ('border_officer', 'border_boss'), kpp_post, bankAccountId
* posts.js (Пограничные пункты): id, name, address
* migration.js (Миграционный учет): id, userId, passportId, direction ('Въезд'/'Выезд'), timestamp, purpose
* permits.js (Визы и Запреты): id, userId, exitPermit, blackListStatus, visaInfo
* neighbours.js (Сопредельные страны): id, countryName

--------------------------------------------------------------------------------
8. НАЦИОНАЛЬНАЯ ИНСПЕКЦИЯ (models/inspect/)
--------------------------------------------------------------------------------
* workers.js (Инспекторы): id, userId, category, license, bankAccountId
* institutions.js (Объекты контроля): id, name, address, ownerId (User)
* checks.js (Журнал ревизий): id, institutionId, date, violationsFound, fineAmount, status
* licenses.js (Лицензирование бизнеса): id, institutionId, type, status

--------------------------------------------------------------------------------
МЕЖТАБЛИЧНЫЕ СВЯЗИ (ASSOCIATIONS)
--------------------------------------------------------------------------------
1. Все модели workers.js принадлежат (belongsTo) модели User по userId.
2. Fine (ГАИ) принадлежит Car по carNumber.
3. Call (Милиция) и Contract (Охрана) привязаны к User через callerId / clientId.
4. Orientation (Милиция) по targetUserId через связь с User подтягивает фото из Passport (photoUrl).