/* ============================================================================
   data/categories.js — 資料室（ARCHIVE）のカテゴリー

   ・記事の cat に、ここの id を書くとそのカテゴリーに入ります
   ・city と character は data/cities.js・data/characters.js から自動で記事が作られます
   ============================================================================ */
window.ORIGIN = window.ORIGIN || {};

ORIGIN.categories = [
  { id: 'world',     name: '世界',         en: 'WORLD' },
  { id: 'system',    name: '世界の仕組み', en: 'SYSTEMS' },
  { id: 'city',      name: '都市',         en: 'CITIES' },
  { id: 'character', name: 'キャラクター', en: 'CHARACTERS' },
];

// 記事はここに集まります（data/articles/*.js が push していきます）
ORIGIN.articles = [];
