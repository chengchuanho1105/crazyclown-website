import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // 只處理 /news/:id 路由
  const newsMatch = path.match(/^\/news\/([^\/]+)$/);
  if (!newsMatch) {
    return; // 不是新聞頁面，放行
  }

  const newsId = newsMatch[1];

  try {
    // 從環境變數取得 Supabase 配置
    const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL");
    const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("缺少 Supabase 環境變數");
      return; // 環境變數不存在，放行
    }

    // 從 Supabase 取得新聞資料
    const response = await fetch(
      `${supabaseUrl}/rest/v1/news?id=eq.${newsId}&select=*&status=eq.published`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Supabase 請求失敗:", response.status);
      return;
    }

    const data = await response.json();
    const news = data[0];

    if (!news) {
      console.log(`找不到 ID 為 ${newsId} 的新聞`);
      return; // 找不到新聞，放行
    }

    // 取得原始 HTML
    const originalResponse = await context.next();
    const html = await originalResponse.text();

    // 準備 meta 資料
    const title = news.title || "新聞詳情";
    const titleWithBrand = `${title} - Crazy Clown`;
    const introduce = news.introduce || "";
    const description = `${title} - ${introduce}`.trim().substring(0, 160);
    const image = news.image || "https://crazyclown.online/media/og-img/crazyclown/og-img.png";
    const newsUrl = `https://crazyclown.online/news/${newsId}`;

    // HTML 編碼函數（防止 XSS）
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // 替換 meta 標籤
    let modifiedHtml = html
      // title
      .replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(titleWithBrand)}</title>`
      )
      // meta description
      .replace(
        /<meta name="description" content="[^"]*"/,
        `<meta name="description" content="${escapeHtml(description)}"`
      )
      // og:title
      .replace(
        /<meta property="og:title" content="[^"]*"/,
        `<meta property="og:title" content="${escapeHtml(title)}"`
      )
      // og:description
      .replace(
        /<meta property="og:description" content="[^"]*"/,
        `<meta property="og:description" content="${escapeHtml(description)}"`
      )
      // og:image
      .replace(
        /<meta property="og:image" content="[^"]*"/,
        `<meta property="og:image" content="${escapeHtml(image)}"`
      )
      // og:url
      .replace(
        /<meta property="og:url" content="[^"]*"/,
        `<meta property="og:url" content="${escapeHtml(newsUrl)}"`
      )
      // og:type
      .replace(
        /<meta property="og:type" content="[^"]*"/,
        `<meta property="og:type" content="article"`
      )
      // twitter:title
      .replace(
        /<meta name="twitter:title" content="[^"]*"/,
        `<meta name="twitter:title" content="${escapeHtml(title)}"`
      )
      // twitter:description
      .replace(
        /<meta name="twitter:description" content="[^"]*"/,
        `<meta name="twitter:description" content="${escapeHtml(description)}"`
      )
      // twitter:image
      .replace(
        /<meta name="twitter:image" content="[^"]*"/,
        `<meta name="twitter:image" content="${escapeHtml(image)}"`
      );

    // 如果 HTML 中沒有 article:published_time，可以加上（新增）
    if (news.show_date && !modifiedHtml.includes("article:published_time")) {
      const publishedTime = new Date(news.show_date).toISOString();
      const headEndIndex = modifiedHtml.indexOf("</head>");
      if (headEndIndex > -1) {
        modifiedHtml =
          modifiedHtml.slice(0, headEndIndex) +
          `    <meta property="article:published_time" content="${publishedTime}" />\n    <meta property="article:author" content="${escapeHtml(news.author || 'Crazy Clown')}" />\n` +
          modifiedHtml.slice(headEndIndex);
      }
    }

    console.log(`✅ 成功為新聞 ${newsId} 注入 meta 標籤`);

    return new Response(modifiedHtml, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=600", // 快取 5-10 分鐘
      },
    });
  } catch (error) {
    console.error("Edge Function 執行錯誤:", error);
    return; // 發生錯誤，放行原始請求
  }
};

