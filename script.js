$(document).ready(function () {

MicroModal.init();

// Zomato
    // put in a city
    //      gives list of cuisines
    //          for populating dropdowns

    // put in a city and a cuisine
    //      gives a list of restaurants and info about each one

// MealDB
    // get a random recipe

    // get all recipe categories
    //      for populating dropdowns
    // get all recipe areas
    //      for populating dropdowns

    // put in an ingredient (or list of ingredients if we decide later)
    //      can also put in a category or type
    //          get a list of recipes with those features
    //          get recipe id for more info

    var zomatoKey = "&apikey=157a4da6ccbad6e7ff675d7496616a8a";
    // this variable is global so it can be populated in get cuisines and used in the restaurant search function
    var cuisineIdArray = [];

    function getCityId(cityName){
        // replace spaces in city name with %20 for zomato
        cityName = cityName.replaceAll(" ", "%20");

        // take user input of a city name and return the city id using zomato cities endpoint
        var queryURL = "https://developers.zomato.com/api/v2.1/cities?q=" + cityName + "&count=1" + zomatoKey;

        $.ajax({
            url: queryURL,
            method: "GET"
          })
            //upon api response
            .then(function(response) {
                var id = response.location_suggestions[0].id;
                // console.log(id);

                // call getCuisines
                getCuisines(id);

                // return city id
                return id;
            });
    }

    function getCuisines(cityId){
        cuisineIdArray = [];
        // use the id in the cuisines endpoint to get a list of cuisines to populate dropdown
        var queryURL = "https://developers.zomato.com/api/v2.1/cuisines?city_id=" + cityId + zomatoKey;
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function(response){
                var cuisineArray = [];
                for (var i = 0; i < response.cuisines.length; i++){
                    cuisineArray.push(response.cuisines[i].cuisine.cuisine_name);
                    cuisineIdArray.push(response.cuisines[i].cuisine.cuisine_id);
                }

                // function to write cuisines to dropdown should be called here, they should have a data type that represents the id
                //      these are stored in cuisineIdArray (some way to know what the id of the cuisine the user picked is)

                // console.log(cuisineArray);
                // console.log(cuisineIdArray);
                // return an array of the cuisine types
                return(cuisineArray);
            });
    }   

    function getRestaurants(cityId, searchWord){
        // array to store restaurant objects
        var restaurantArray = [];
        // using the city id from city selected by the user and cuisineTypeId if one was selected
        //      if no cuisine type entered cuisineType should be 0
        var queryURL = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&count=50";
        if (searchWord != ""){
            queryURL+= "&q=";
            queryURL += searchWord;
        }
        queryURL += zomatoKey;

        // use zomato search endpoint and return an array of restaurant objects
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function(response) {
                var indexArray = [];
                for (var i = 0; i < response.restaurants.length; i ++){
                    indexArray.push(i);
                }
                // console.log(indexArray);
                for (var i = 0; i < Math.min(10,response.restaurants.length); i++){
                    var randIndex = Math.floor(Math.random()*indexArray.length);
                    var randNum = indexArray[randIndex];
                    indexArray.splice(randIndex, 1);
                    var restaurantObject = {
                        // restaurant attributes to store, more can be added later
                        name: response.restaurants[randNum].restaurant.name,
                        url: response.restaurants[randNum].restaurant.url,
                        phone: response.restaurants[randNum].restaurant.phone_numbers,
                        featuredImg: response.restaurants[randNum].restaurant.featured_image,
                        location: response.restaurants[randNum].restaurant.location.address,
                        cuisines: response.restaurants[randNum].restaurant.cuisines,
                        menuURL: response.restaurants[randNum].restaurant.menu_url,
                        hours: response.restaurants[randNum].restaurant.timings,
                        rating: response.restaurants[randNum].restaurant.user_rating.aggregate_rating,

                    };
                    restaurantArray.push(restaurantObject);
                 
                // placing restaurant info in cards
                $("#headerRest"+i).text(restaurantObject.name);
                $("#imgRest"+i).attr("src", restaurantObject.featuredImg);
                $("#hoursRest"+i).text("Hours: " + restaurantObject.hours);
                $("#ratingRest"+i).text("Rating: " + restaurantObject.rating + " / 5");
                $("#modal-rest"+i+"-title").text(restaurantObject.name);

            }
            // checking for more info to pull
                console.log(restaurantArray);
                // the function call for displaying the restaurants should go here
                return restaurantArray;
            });
    }

    
    mealdbKey = "1";

    function randomRecipe() {
        // returns a random recipe object
        var queryURL = "https://www.themealdb.com/api/json/v1/1/random.php";
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function(response){
                var newRecipe = {
                    // recipe attributes to be stored, more can be added later
                    name: response.meals[0].strMeal,
                    url: response.meals[0].strYoutube,
                    img: response.meals[0].strMealThumb,
                    area: response.meals[0].strArea,
                    id: response.meals[0].idMeal,
                    source: response.meals[0].strSource,
                    ingredients: [],
                    servings: []
                };
                
                var j = 1;
                while (j < 21 && response.meals[0]["strIngredient" + j] != "" && response.meals[0]["strIngredient" + j] != " " && response.meals[0]["strIngredient" + j] != null){
                    newRecipe.ingredients.push(response.meals[0]["strIngredient" + j]);
                    j+= 1;
                }
                var j = 1;
                while (j < 21 && response.meals[0]["strMeasure" + j] != "" && response.meals[0]["strMeasure" + j] != " " && response.meals[0]["strMeasure" + j] != null){
                    newRecipe.servings.push(response.meals[0]["strMeasure" + j]);
                    j+= 1;
                }
                
                $('#randMealName').text(newRecipe.name);
                $('#randMeal').attr("src", newRecipe.img);
                $('#modal-random-title').text(newRecipe.name);
                $("recipe-list-random").html(totalIngredients);
                

                // recipe strings goes in modal
                // youtube link in modal
                // source link in modal


                // console.log(newRecipe);
                // console.log(response);
                // function for displaying the recipe should be called here
                return newRecipe;
            });
    }

    function getCategory(){
        // returns an array of recipe categorys
        var queryURL = "https://www.themealdb.com/api/json/v1/1/categories.php";
        var categoryArray = [];
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function(response){
                for (i = 0; i < response.categories.length; i++){
                    categoryArray.push(response.categories[i].strCategory);
                    var newOption = $("<option>");
                    newOption.attr("value", categoryArray[categoryArray.length-1]);
                    newOption.text(categoryArray[categoryArray.length-1]);
                    $("#category").append(newOption);
                }
                // console.log(categoryArray);
                // console.log(response);
                // function to render the categories in the dropdown should be called here
                return categoryArray;
            });


    }

    function getArea(){
        // returns an array of recipe areas
        var queryURL = "https://www.themealdb.com/api/json/v1/1/list.php?a=list";
        var areaArray = [];
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function(response){
                for (i = 0; i < response.meals.length; i++){
                    areaArray.push(response.meals[i].strArea);
                    var newOption = $("<option>");
                    newOption.attr("value", areaArray[areaArray.length-1]);
                    newOption.text(areaArray[areaArray.length-1]);
                    $("#area").append(newOption);
                }
                // console.log(areaArray);
                // console.log(response);
                // function to render the areas in the dropdown should be called here
                return areaArray;
            });
    }

    function recipeSearch(queryType, query){
        // takes a queryType (1 for ingredient,2 for category or 3 for area)
        //      and a query (the ingredient, area or category to search for)
        var idArray = [];
        var recipeArray = [];
        var queryURL = "";
        // ingredient search
        if (queryType == 1){
            queryURL = "https://www.themealdb.com/api/json/v1/1/filter.php?i=" + query;
        }
        // area search
        else if (queryType == 2){
            queryURL = "https://www.themealdb.com/api/json/v1/1/filter.php?a=" + query;
        }
        // category search
        else if (queryType == 3){
            queryURL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=" + query;
        }
        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function(response){
                // store ids in an array (quantity can be decided later)
                var indexArray = [];
                for (var i = 0; i < response.meals.length; i ++){
                    indexArray.push(i);
                }
                
                for (var i = 0; i < Math.min(8, response.meals.length); i++){
                    var randIndex = Math.floor(Math.random()*indexArray.length);
                    var randNum = indexArray[randIndex];
                    indexArray.splice(randIndex, 1);
                    idArray.push(response.meals[randNum].idMeal);;
                }
                // console.log(idArray);
                // search recipes individually by id and add their information to an object
                // add the object to an array 
                for (var i = 0; i < idArray.length; i++){
                    queryURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + idArray[i];
                    $.ajax({
                        url: queryURL,
                        method: "GET"
                    })
                        .then(function(response) {
                            var newRecipe = {
                                // recipe attributes to be stored, more can be added later
                                name: response.meals[0].strMeal,
                                url: response.meals[0].strYoutube,
                                img: response.meals[0].strMealThumb,
                                area: response.meals[0].strArea,
                                id: response.meals[0].idMeal,
                                img: response.meals[0].strMealThumb, 
                                ingredients: [],
                                servings: [],
                                instructions: response.meals[0].strInstructions
                            };
                            var j = 1;
                            while (j < 21 && response.meals[0]["strIngredient" + j] != "" && response.meals[0]["strIngredient" + j] != " " && response.meals[0]["strIngredient" + j] != null) {
                                newRecipe.ingredients.push(response.meals[0]["strIngredient" + j]);
                                j += 1;
                            }
                            var j = 1;
                            while (j < 21 && response.meals[0]["strMeasure" + j] != "" && response.meals[0]["strMeasure" + j] != " " && response.meals[0]["strMeasure" + j] != null) {
                                newRecipe.servings.push(response.meals[0]["strMeasure" + j]);
                                j += 1;
                            }
                            recipeArray.push(newRecipe);
                            
                            for (var k = 0; k < recipeArray.length; k++) {
                                var ingredientsStr = newRecipe.servings[k] + "- " + newRecipe.ingredients[k]
                                var totalIngredients = $("<li>").text(ingredientsStr);
                                $("#nameCook" + k).text(recipeArray[k].name);
                                $("#imgCook" + k).attr("src", recipeArray[k].img);
                                $("#modal-cook"+k+"-title").text(recipeArray[k].name);
                                $("#recipeStr" + k).append(totalIngredients);
                                $("#instructionStr"+k).text(recipeArray[k].instructions);

                        }
                        // console.log(response);
                    });
                        
                }
                // console.log(recipeArray);
                
                
                // recipes should be rendered here
                return recipeArray;
            });
    
        }
    
    // getCityId("london");

    // getRestaurants(61,25);
    
    randomRecipe();

    getCategory();

    getArea();


    // search by ingredient: beef
    // recipeSearch(1, "beef");

    // search by area: chinese
    // recipeSearch(2, "chinese");

    // search by category: breakfast
    // recipeSearch(3, "breakfast");

    
    // smoothly scolls to specified area on page
    

    function scrollTo(area) {
        $('html,body').animate({
            scrollTop: $(area).offset().top},
            'slow');
    }
    
    $(document).on("click", "#recipe-submit", function(event){
        event.preventDefault();
        $("#cardAreaCook").hide();
        var ingredient = $("#ingredient").val();
        var category = $("#category").val();
        var area = $("#area").val();
        // console.log(category + ingredient + area);
        if (ingredient != ""){
            recipeSearch(1, ingredient);
        }
        else if (category != ""){
            recipeSearch(3, category);
        }
        else if (area != ""){
            recipeSearch(2, area);
        }
        $("#cook-cards").show();
        scrollTo("#cook-cards");
        // clear forms
    });
    

    // randomizes another recipe to be displayed
    $(document).on("click", "#btn-retry", function(event) {
        event.preventDefault();
        randomRecipe();
    });
    
    $(document).on("click", "#restaurant-submit", function(event){
        event.preventDefault();
        getRestaurants(getCityId($("#city-form").val()),$("#cuisine-form").val());
        // getRestaurants(61, "chinese");
        $("#rest-cards").show();
        scrollTo("#rest-cards");
    });

    $(document).on("click", "#recipe-reset", function(event){
        event.preventDefault();
        // make form disappear, bring back to landing page
        $(".cook-content").hide();
        $("#cook-cards").hide();
    });

    $(document).on("click", "#restaurant-reset", function(event){
        event.preventDefault();
        // make form disappear, bring back to landing page
        $(".eatOut").hide();
        $("#rest-cards").hide();
    });

    $("#cook-form-show").on("click", function(event){
        event.preventDefault();
        $(".cook-content").show();
        $(".eatOut").hide();
        $("#rest-cards").hide();
        scrollTo(".cook-content");
    });

    $("#rest-form-show").on("click", function(event){
        event.preventDefault();
        $(".eatOut").show();
        $(".cook-content").hide();
        $("#cook-cards").hide();
        scrollTo(".eatOut");
    });
    
});
