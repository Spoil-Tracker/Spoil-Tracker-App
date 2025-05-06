import fetch from 'node-fetch';

const API_KEY = process.env.EXPO_PUBLIC_FDA_API_KEY;

async function getNutrition(query: string) {
  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=1&api_key=${API_KEY}`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  const food = searchData.foods?.[0];
  if (!food) throw new Error('No food found');

  const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${API_KEY}`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();

  return detailData;
}

// Example usage:
getNutrition('cheddar cheese')
  .then(data => console.log(data))
  .catch(err => console.error(err));
