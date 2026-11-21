class NewsService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Лента новостей для главной страницы (с цветами ведомств)
  async getFeed({ limit = 30, offset = 0, departmentCode = null } = {}) {
    const where = departmentCode ? { departmentCode } : {};
    const news = await this.db.News.findAll({
      where,
      order: [
        ["isEmergency", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit,
      offset,
    });

    const departments = await this.db.Department.findAll();
    const deptMap = Object.fromEntries(departments.map((d) => [d.code, d]));

    return news.map((item) => {
      const plain = item.toJSON();
      const dept = deptMap[plain.departmentCode];
      return {
        ...plain,
        departmentName: dept ? dept.name : "Государственная система",
        badgeColor: dept ? dept.badgeColor : "#334155",
      };
    });
  }

  // Публикация новости от имени службы
  async publishNews({
    title,
    content,
    photoUrl,
    departmentCode,
    authorUid,
    isEmergency = false,
  }) {
    const article = await this.db.News.create({
      title,
      content,
      photoUrl: photoUrl || null,
      departmentCode,
      authorUid,
      isEmergency: Boolean(isEmergency),
    });

    await this.db.AuditLog.create({
      actorUid: authorUid,
      departmentCode,
      action: "NEWS_PUBLISHED",
      targetTable: "News",
      targetRecordId: String(article.id),
      afterData: { title },
    });

    if (this.events) this.events.emit("news:published", { article });
    return article;
  }
}

module.exports = NewsService;
