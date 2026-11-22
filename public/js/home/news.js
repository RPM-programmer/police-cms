window.HomeNews = {
  async loadFeed(apiBase, deptFilter = "") {
    const feedEl = document.getElementById("news-feed");
    const query = deptFilter ? `?dept=${encodeURIComponent(deptFilter)}` : "";

    const res = await fetch(`${apiBase}/news${query}`, {
      credentials: "include",
    });
    const json = await res.json();

    if (!json.success || !json.data.length) {
      feedEl.innerHTML =
        '<div class="panel-card">По выбранному фильтру публикаций пока нет.</div>';
      return;
    }

    feedEl.innerHTML = json.data
      .map(
        (item) => `
        <article class="news-card ${item.isEmergency ? "emergency" : ""}" data-dept="${item.departmentCode}">
          <div class="news-stripe"></div>
          <div class="news-body">
            <div class="news-header">
              <span class="dept-tag">${item.departmentName}</span>
              <time class="news-time">${new Date(item.createdAt).toLocaleString("ru-RU")}</time>
            </div>
            <h2 class="news-title">${item.title}</h2>
            <p class="news-content">${item.content}</p>
            ${item.photoUrl ? `<div class="news-media"><img src="${item.photoUrl}" alt="Фото сводки"></div>` : ""}
          </div>
        </article>
      `,
      )
      .join("");
  },
};
