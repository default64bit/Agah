import Article from "./models/Article";

const baseUrl = `${process.env.PROTOCOL}://${process.env.DOMAIN}`;

let metaData = {
    title: "گروه وکلای آگه",
    description: "گروه وکلای آگه، ارائه دهنده انواع خدمات حقوقی در زمینه های مختلف - مشاوره حقوقی آنلاین و حضوری - وبلاگ مطالب و سوالات حقوقی",
    keywords: "",
    author: "",
    language: "fa",

    "og:locale": "fa_IR",
    "og:type": "article",
    "og:title": "گروه وکلای آگه",
    "og:description": "گروه وکلای آگه، ارائه دهنده انواع خدمات حقوقی در زمینه های مختلف - مشاوره حقوقی آنلاین و حضوری - وبلاگ مطالب و سوالات حقوقی",
    "og:url": `${baseUrl}`,
    "og:site_name": "گروه وکلای آگه",
    "og:image": `${baseUrl}/img/icons/android-chrome-192x192.png`,

    "article:section": "حقوقی",
    "article:published_time": new Date(Date.now()).toISOString(),
    "article:modified_time": "",

    "twitter:card": "summary_large_image",
    "twitter:site": `${baseUrl}`,
    "twitter:description": "گروه وکلای آگه، ارائه دهنده انواع خدمات حقوقی در زمینه های مختلف - مشاوره حقوقی آنلاین و حضوری - وبلاگ مطالب و سوالات حقوقی",
    "twitter:title": "گروه وکلای آگه",
    "twitter:image": `${baseUrl}/img/icons/android-chrome-192x192.png`,

    robots: "max-image-preview:large",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#f5f5f5",
    "theme-color": "#f5f5f5",

    canonical: `${baseUrl}`,
    "apple-touch-icon": `${baseUrl}/img/icons/android-chrome-192x192.png`,
    "shortcut-icon": `${baseUrl}/favicon.ico`,
};

export async function generateMetaData(url) {
    let metaString = "";
    const route = url.split("/");

    metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = "گروه وکلای آگه";
    metaData["description"] = metaData["og:description"] = metaData["twitter:description"] =
        "گروه وکلای آگه، ارائه دهنده انواع خدمات حقوقی در زمینه های مختلف - مشاوره حقوقی آنلاین و حضوری - وبلاگ مطالب و سوالات حقوقی";
    metaData["og:image"] = metaData["twitter:image"] = `${baseUrl}/img/icons/android-chrome-192x192.png`;
    metaData["canonical"] = metaData["og:url"] = metaData["twitter:site"] = `${baseUrl}${url}`;

    switch (route[1]) {
        case "":
            break;
        case "frequently-asked-legal-questions":
            metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = "سوالات پرتکرار حقوقی - گروه وکلای آگه";
            metaData["description"] = metaData["og:description"] = metaData["twitter:description"] = "سوالات پرتکرار حقوقی";
            break;
        case "blog":
            metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = "وبلاگ مطالب حقوقی - گروه وکلای آگه";
            metaData["description"] = metaData["og:description"] = metaData["twitter:description"] = "وبلاگ مطالب حقوقی";
            break;
        case "article":
            if (!route[2]) break;

            let url_code = 0;
            try {
                url_code = parseInt(route[2].toString());
            } catch (e) {}
            const article = await Article.model.findOne({ url_code: url_code }).exec();
            if (!article) break;

            metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = `${article.metadata.title} - گروه وکلای آگه`;
            metaData["description"] = metaData["og:description"] = metaData["twitter:description"] = article.metadata.description;
            metaData["og:image"] = metaData["twitter:image"] = `${baseUrl}${article.metadata.thumbnail}`;
            metaData["keywords"] = article.metadata.keywords;

            metaData["author"] = article.metadata.author;
            metaData["article:published_time"] = article.publishedAt.toISOString();

            metaString += `
            <meta name="author" content="${metaData.author}">
            <meta name="keywords" content="${metaData.keywords}">
            <meta property="article:section" content="${metaData["article:section"]}">
            <meta property="article:published_time" content="${metaData["article:published_time"]}">
            `;
            break;
        case "terms-and-conditions":
            metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = "قوانین و مقررات - گروه وکلای آگه";
            break;
        case "consultation-time-booking":
            metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = "رزرو وقت مشاوره - گروه وکلای آگه";
            metaData["description"] = metaData["og:description"] = metaData["twitter:description"] = "رزرو وقت مشاوره آنلاین و حضوری";
            break;
        case "profile":
            metaData["title"] = metaData["og:title"] = metaData["twitter:title"] = "حساب کاربری - گروه وکلای آگه";
            break;
    }

    metaString += `
    <title>${metaData.title}</title>
    <meta name="description" content="${metaData.description}">
    <meta name="language" content="${metaData.language}">

    <meta property="og:locale" content="${metaData["og:locale"]}">
    <meta property="og:type" content="${metaData["og:type"]}">
    <meta property="og:title" content="${metaData["og:title"]}">
    <meta property="og:description" content="${metaData["og:description"]}">
    <meta property="og:url" content="${metaData["og:url"]}">
    <meta property="og:site_name" content="${metaData["og:site_name"]}">
    <meta property="og:image" content="${metaData["og:image"]}">

    <meta name="twitter:card" content="${metaData["twitter:card"]}">
    <meta name="twitter:site" content="${metaData["twitter:site"]}">
    <meta name="twitter:description" content="${metaData["twitter:description"]}">
    <meta name="twitter:title" content="${metaData["twitter:title"]}">
    <meta name="twitter:image" content="${metaData["twitter:image"]}">

    <meta name="robots" content="${metaData["robots"]}">
    <meta name="mobile-web-app-capable" content="${metaData["mobile-web-app-capable"]}">
    <meta name="msapplication-TileColor" content="${metaData["msapplication-TileColor"]}">
    <meta name="theme-color" content="${metaData["theme-color"]}">

    <link rel="canonical" href="${metaData["canonical"]}">
    <link rel="apple-touch-icon" sizes="180x180" href="${metaData["apple-touch-icon"]}">
    <link rel="shortcut icon" type="image/x-icon" href="${metaData["shortcut-icon"]}">
    `;

    return metaString;
}
