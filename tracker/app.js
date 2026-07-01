// Simple Calorie + Protein Tracker
// Uses USDA FoodData Central API
// API key is saved locally in your browser only.

const STORAGE_KEYS = {
  apiKey: "calorieTracker_usdaApiKey",
  foods: "calorieTracker_todayFoods"
};

let todayFoods = [];
let selectedFood = null;

// DOM Elements
const apiKeySection = document.getElementById("apiKeySection");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");

const totalCaloriesEl = document.getElementById("totalCalories");
const totalProteinEl = document.getElementById("totalProtein");

const foodSearchInput = document.getElementById("foodSearchInput");
const searchFoodBtn = document.getElementById("searchFoodBtn");
const searchStatus = document.getElementById("searchStatus");
const searchResults = document.getElementById("searchResults");

const selectedFoodSection = document.getElementById("selectedFoodSection");
const selectedFoodName = document.getElementById("selectedFoodName");
const servingsInput = document.getElementById("servingsInput");
const caloriesInput = document.getElementById("caloriesInput");
const proteinInput = document.getElementById("proteinInput");
const addSelectedFoodBtn = document.getElementById("addSelectedFoodBtn");

const manualFoodName = document.getElementById("manualFoodName");
const manualCalories = document.getElementById("manualCalories");
const manualProtein = document.getElementById("manualProtein");
const addManualFoodBtn = document.getElementById("addManualFoodBtn");

const foodList = document.getElementById("foodList");
const newDayBtn = document.getElementById("newDayBtn");

// Start App
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  loadApiKeyStatus();
  loadFoods();
  renderFoods();
  updateTotals();

  saveApiKeyBtn.addEventListener("click", saveApiKey);
  searchFoodBtn.addEventListener("click", searchFood);
  addSelectedFoodBtn.addEventListener("click", addSelectedFood);
  addManualFoodBtn.addEventListener("click", addManualFood);
  newDayBtn.addEventListener("click", startNewDay);

  foodSearchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchFood();
    }
  });
}

// API Key
function getApiKey() {
  return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
}

function saveApiKey() {
  const key = apiKeyInput.value.trim();

  if (!key) {
    alert("Paste your USDA API key first.");
    return;
  }

  localStorage.setItem(STORAGE_KEYS.apiKey, key);
  apiKeyInput.value = "";
  loadApiKeyStatus();

  alert("API key saved on this browser.");
}

function loadApiKeyStatus() {
  const key = getApiKey();

  if (key) {
    apiKeyInput.placeholder = "API key saved";
    saveApiKeyBtn.textContent = "Update API Key";
  } else {
    apiKeyInput.placeholder = "Paste USDA API key";
    saveApiKeyBtn.textContent = "Save API Key";
  }
}

// Local Food Storage
function loadFoods() {
  const savedFoods = localStorage.getItem(STORAGE_KEYS.foods);

  if (!savedFoods) {
    todayFoods = [];
    return;
  }

  try {
    todayFoods = JSON.parse(savedFoods);
  } catch (error) {
    todayFoods = [];
    localStorage.removeItem(STORAGE_KEYS.foods);
  }
}

function saveFoods() {
  localStorage.setItem(STORAGE_KEYS.foods, JSON.stringify(todayFoods));
}

// Search USDA
async function searchFood() {
  const apiKey = getApiKey();
  const query = foodSearchInput.value.trim();

  clearSearchResults();
  hideSelectedFood();

  if (!apiKey) {
    searchStatus.textContent = "Save your USDA API key first.";
    return;
  }

  if (!query) {
    searchStatus.textContent = "Type a food name first.";
    return;
  }

  searchStatus.textContent = "Searching USDA...";
  searchFoodBtn.disabled = true;
  searchFoodBtn.textContent = "Searching...";

  try {
    const url = buildSearchUrl(query, apiKey);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();
    const foods = Array.isArray(data.foods) ? data.foods : [];

    if (foods.length === 0) {
      searchStatus.textContent = "No results found. Use manual entry.";
      return;
    }

    searchStatus.textContent = `Found ${foods.length} result${foods.length === 1 ? "" : "s"}. Pick the closest one.`;
    renderSearchResults(foods);
  } catch (error) {
    console.error(error);
    searchStatus.textContent = "Search failed. Check your API key or use manual entry.";
  } finally {
    searchFoodBtn.disabled = false;
    searchFoodBtn.textContent = "Search Calories";
  }
}

function buildSearchUrl(query, apiKey) {
  const baseUrl = "https://api.nal.usda.gov/fdc/v1/foods/search";

  const params = new URLSearchParams({
    api_key: apiKey,
    query: query,
    pageSize: "10"
  });

  return `${baseUrl}?${params.toString()}`;
}

function clearSearchResults() {
  searchStatus.textContent = "";
  searchResults.innerHTML = "";
}

function renderSearchResults(foods) {
  searchResults.innerHTML = "";

  foods.forEach(function (food) {
    const nutrition = getNutritionFromFood(food);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "result-item";

    const title = document.createElement("span");
    title.className = "result-title";
    title.textContent = cleanFoodName(food.description || "Unnamed food");

    const details = document.createElement("span");
    details.className = "result-details";

    const caloriesText = nutrition.calories !== null ? `${nutrition.calories} cal` : "Calories unknown";
    const proteinText = nutrition.protein !== null ? `${nutrition.protein}g protein` : "Protein unknown";
    const dataType = food.dataType ? ` • ${food.dataType}` : "";

    details.textContent = `${caloriesText} • ${proteinText}${dataType}`;

    button.appendChild(title);
    button.appendChild(details);

    button.addEventListener("click", function () {
      selectFood(food);
    });

    searchResults.appendChild(button);
  });
}

function selectFood(food) {
  const nutrition = getNutritionFromFood(food);

  selectedFood = {
    name: cleanFoodName(food.description || "Selected food"),
    caloriesPerServing: nutrition.calories || 0,
    proteinPerServing: nutrition.protein || 0
  };

  selectedFoodName.textContent = selectedFood.name;
  servingsInput.value = "1";
  caloriesInput.value = selectedFood.caloriesPerServing;
  proteinInput.value = selectedFood.proteinPerServing;

  selectedFoodSection.classList.remove("hidden");
}

// Pull Calories + Protein from USDA Result
function getNutritionFromFood(food) {
  const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];

  let calories = null;
  let protein = null;

  nutrients.forEach(function (nutrient) {
    const name = String(nutrient.nutrientName || "").toLowerCase();
    const unit = String(nutrient.unitName || "").toLowerCase();
    const nutrientNumber = String(nutrient.nutrientNumber || "");
    const nutrientId = String(nutrient.nutrientId || "");
    const value = Number(nutrient.value);

    if (!Number.isFinite(value)) {
      return;
    }

    // USDA commonly returns calories as Energy in KCAL.
    // Older records may use nutrient number 208.
    // Newer records may use nutrient id 1008.
    const isCalories =
      (name === "energy" && unit === "kcal") ||
      nutrientNumber === "208" ||
      nutrientId === "1008";

    // USDA protein is commonly nutrient number 203 or nutrient id 1003.
    const isProtein =
      name === "protein" ||
      nutrientNumber === "203" ||
      nutrientId === "1003";

    if (isCalories && calories === null) {
      calories = Math.round(value);
    }

    if (isProtein && protein === null) {
      protein = roundToOne(value);
    }
  });

  return {
    calories,
    protein
  };
}

// Add Selected USDA Food
function addSelectedFood() {
  if (!selectedFood) {
    alert("Pick a food result first.");
    return;
  }

  const servings = Number(servingsInput.value);
  const caloriesPerServing = Number(caloriesInput.value);
  const proteinPerServing = Number(proteinInput.value);

  if (!Number.isFinite(servings) || servings <= 0) {
    alert("Enter a valid serving amount.");
    return;
  }

  if (!Number.isFinite(caloriesPerServing) || caloriesPerServing < 0) {
    alert("Enter valid calories.");
    return;
  }

  if (!Number.isFinite(proteinPerServing) || proteinPerServing < 0) {
    alert("Enter valid protein.");
    return;
  }

  const entry = {
    id: createId(),
    name: selectedFood.name,
    servings: servings,
    calories: Math.round(caloriesPerServing * servings),
    protein: roundToOne(proteinPerServing * servings)
  };

  todayFoods.push(entry);
  saveFoods();
  renderFoods();
  updateTotals();

  foodSearchInput.value = "";
  clearSearchResults();
  hideSelectedFood();
}

// Manual Entry
function addManualFood() {
  const name = manualFoodName.value.trim();
  const calories = Number(manualCalories.value);
  const protein = Number(manualProtein.value);

  if (!name) {
    alert("Enter a food name.");
    return;
  }

  if (!Number.isFinite(calories) || calories < 0) {
    alert("Enter valid calories.");
    return;
  }

  if (!Number.isFinite(protein) || protein < 0) {
    alert("Enter valid protein.");
    return;
  }

  const entry = {
    id: createId(),
    name: name,
    servings: 1,
    calories: Math.round(calories),
    protein: roundToOne(protein)
  };

  todayFoods.push(entry);
  saveFoods();
  renderFoods();
  updateTotals();

  manualFoodName.value = "";
  manualCalories.value = "";
  manualProtein.value = "";
}

// Render Today's Food List
function renderFoods() {
  foodList.innerHTML = "";

  if (todayFoods.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No food added yet.";
    foodList.appendChild(emptyMessage);
    return;
  }

  todayFoods.forEach(function (food) {
    const item = document.createElement("div");
    item.className = "food-item";

    const info = document.createElement("div");

    const name = document.createElement("div");
    name.className = "food-name";
    name.textContent = food.name;

    const meta = document.createElement("div");
    meta.className = "food-meta";
    meta.textContent = `${food.calories} calories • ${food.protein}g protein • ${formatServings(food.servings)}`;

    info.appendChild(name);
    info.appendChild(meta);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-food-btn";
    removeBtn.textContent = "Remove";

    removeBtn.addEventListener("click", function () {
      removeFood(food.id);
    });

    item.appendChild(info);
    item.appendChild(removeBtn);

    foodList.appendChild(item);
  });
}

function removeFood(id) {
  todayFoods = todayFoods.filter(function (food) {
    return food.id !== id;
  });

  saveFoods();
  renderFoods();
  updateTotals();
}

function updateTotals() {
  const totalCalories = todayFoods.reduce(function (sum, food) {
    return sum + Number(food.calories || 0);
  }, 0);

  const totalProtein = todayFoods.reduce(function (sum, food) {
    return sum + Number(food.protein || 0);
  }, 0);

  totalCaloriesEl.textContent = Math.round(totalCalories);
  totalProteinEl.textContent = roundToOne(totalProtein);
}

// New Day Reset
function startNewDay() {
  const confirmed = confirm("Clear today's food list and start a new day?");

  if (!confirmed) {
    return;
  }

  todayFoods = [];
  saveFoods();
  renderFoods();
  updateTotals();
  clearSearchResults();
  hideSelectedFood();
}

// Helpers
function hideSelectedFood() {
  selectedFood = null;
  selectedFoodSection.classList.add("hidden");
}

function cleanFoodName(name) {
  return String(name)
    .replace(/\s+/g, " ")
    .trim();
}

function roundToOne(number) {
  return Math.round(Number(number) * 10) / 10;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatServings(servings) {
  const value = Number(servings);

  if (!Number.isFinite(value)) {
    return "1 serving";
  }

  return `${value} serving${value === 1 ? "" : "s"}`;
}
