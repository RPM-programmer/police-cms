module.exports = {
  traffic_police: [
    { code: "patrol", label: "Патрульный (Пробив авто / Штрафы)" },
    { code: "vehicle_reg", label: "Регистратор машин (МРЭО)" },
    { code: "license_inspector", label: "Инспектор по выдаче прав (ВУ)" },
    { code: "traffic_controller", label: "Регулировщик / Инспектор ДТП" },
  ],
  police: [
    { code: "duty_102", label: "Дежурная часть (Вызовы 102 / ИВС)" },
    { code: "detective", label: "Оперативник (Объявление в розыск)" },
    { code: "investigator", label: "Следователь (Уголовные дела)" },
  ],
  security: [
    { code: "guard_objects", label: "Пультовая охрана объектов / ГБР" },
    {
      code: "weapon_licensing",
      label: "Лицензирование оружия и пулегильзотека",
    },
  ],
  border_guards: [
    { code: "kpp_controller", label: "Контролёр КПП (Проверка въезда/выезда)" },
    {
      code: "migration_officer",
      label: "Миграционный инспектор (Визы / Стоп-листы)",
    },
  ],
  court: [
    { code: "warrant_judge", label: "Судья по санкциям и ордерам" },
    { code: "trial_judge", label: "Судья по рассмотрению дел и приговорам" },
  ],
  InspectionMinistry: [
    {
      code: "company_registrar",
      label: "Регистратор юридических лиц и граждан",
    },
    { code: "field_inspector", label: "Государственный инспектор проверок" },
  ],
  KGB: [
    { code: "operative", label: "Оперативник (Секретные архивы / ОРМ)" },
    {
      code: "internal_security",
      label: "Управление «К» и спецпроверки гос. аппарата",
    },
  ],
};
