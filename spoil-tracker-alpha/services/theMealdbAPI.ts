//Website: https://www.themealdb.com/api.php
//A test key of "1" is allowed for dev and educational use

const MEAL_DB_API_KEY = "1";

export interface MealDBJSON {
    meals: Meal[]
  }
  
  export interface Meal {
    idMeal: string
    strMeal: string
    strMealAlternate: any
    strCategory: string
    strArea: string
    strInstructions: string
    strMealThumb: string
    strTags?: string
    strYoutube: string
    strIngredient1: string
    strIngredient2: string
    strIngredient3: string
    strIngredient4: string
    strIngredient5: string
    strIngredient6: string
    strIngredient7: string
    strIngredient8: string
    strIngredient9: string
    strIngredient10: string
    strIngredient11: string
    strIngredient12: string
    strIngredient13: string
    strIngredient14: string
    strIngredient15: string
    strIngredient16?: string
    strIngredient17?: string
    strIngredient18?: string
    strIngredient19?: string
    strIngredient20?: string
    strMeasure1: string
    strMeasure2: string
    strMeasure3: string
    strMeasure4: string
    strMeasure5: string
    strMeasure6: string
    strMeasure7: string
    strMeasure8: string
    strMeasure9: string
    strMeasure10: string
    strMeasure11: string
    strMeasure12: string
    strMeasure13: string
    strMeasure14: string
    strMeasure15: string
    strMeasure16?: string
    strMeasure17?: string
    strMeasure18?: string
    strMeasure19?: string
    strMeasure20?: string
    strSource?: string
    strImageSource: string
    strCreativeCommonsConfirmed: string
    dateModified: string
  }
  

export async function MealDBSearchMealByName(meal_name: string): Promise<MealDBJSON> {

    const apiUrl = `https://www.themealdb.com/api/json/v1/${MEAL_DB_API_KEY}/search.php?s=${meal_name}`;
    const response = await fetch(apiUrl);

    
    if (!response.ok)
        throw new Error(`The Meal DB couldn't reply: ${response.statusText}`)

    const data: MealDBJSON = await response.json();

    console.log(data);

    return data;
}

//We would need premium to search with more than one ingredient
export async function MealDBSearchMealByIngredient(ingredient: string): Promise<MealDBJSON> {

    const apiUrl = `https://www.themealdb.com/api/json/v1/${MEAL_DB_API_KEY}/search.php?i=${ingredient}`;
    const response = await fetch(apiUrl);

    
    if (!response.ok)
        throw new Error(`The Meal DB couldn't reply: ${response.statusText}`)

    const data: MealDBJSON = await response.json();

    console.log(data);

    return data;
}

export async function MealDBRandomMeal(): Promise<MealDBJSON> {

    const apiUrl = `https://www.themealdb.com/api/json/v1/${MEAL_DB_API_KEY}/random.php`;
    const response = await fetch(apiUrl);

    
    if (!response.ok)
        throw new Error(`The Meal DB couldn't reply: ${response.statusText}`)

    const data: MealDBJSON = await response.json();

    console.log(data);

    return data;
}


//Test code
MealDBRandomMeal();
MealDBSearchMealByIngredient("chicken_breast");
MealDBSearchMealByName("Arrabiata")