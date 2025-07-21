//deploy it once and check the PLANTS

const apiKey = "3EmO8E0NSnTf9wN5g7bdOX4oLoBi43vILRvZh43ZEbk2P4Qs63"; // 🔐 Replace this with your actual API key
let UploadedImage;
let base64Image = "";
let query;
// 1. Define my data model
let PlantObj = {
    name: [], // array
    description: "",
    img: "",
    Edible_Parts:"",// array
    watering: null,
    propagation_methods: [],// array
    best_watering: "",
    best_light_condition: "",
    best_soil_type: "",
    common_uses: "",
    Toxicity:"",
    cultural_significance: "",
    gpt:[],// array
};
var arraccestokens = [];
var count = 0;

// Preparing DOM elements & Click events.
var next = document.getElementById("next");
var result = document.getElementById("result")
var nextbtn = document.createElement('button'); // next button
var prevbtn = document.createElement('button'); // previous button
var imageInput = document.getElementById('imageInput'); // stores the uploaded Img Url base64 which API can read
var Idebutton =  document.createElement("button");
var searchBtn = document.getElementById("searchBtn");

Idebutton.classList.add('btn')
nextbtn.classList.add('btn')
prevbtn.classList.add('btn')
searchBtn.classList.add('btn')
//var preview =  document.createElement("button");
var previewimg = document.createElement('img')
var ImageHeading = document.createElement("h3")
nextbtn.textContent = "Next Plant"
prevbtn.textContent = "Previous Plant"


  

document.getElementById("searchBtn").addEventListener("click", ()=>{
    query = document.getElementById("plantName").value.trim();
    if (!query) return alert("Please enter a plant name!");
    fetchAllPlants();
})

imageInput.addEventListener("change",()=>{// uploads an image sent form the input option
    result.innerHTML ="";
    next.innerHTML ="";
    UploadedImage = imageInput.files[0];
    ImageHeading.innerHTML = ""
    previewimg.src = ""; // result includes base64 + type
    Idebutton.innerHTML = ""
    if (!UploadedImage) return;

    const reader = new FileReader();

    reader.onloadend = () => {
       
        ImageHeading.innerHTML = "Image Preview"
        previewimg.src= reader.result; // result includes base64 + type
        result.append(ImageHeading); // image heading
        result.append(previewimg); // preview of the image
        next.append(Idebutton); // append Identify button
        Idebutton.innerHTML = "Identify"
      };
    
      reader.readAsDataURL(UploadedImage);
   
});


Idebutton.addEventListener("click",()=>{
    result.innerHTML = " 🔍 Fetching the Data"
    main();
});
    
function main(){
    const reader = new FileReader();
    reader.readAsDataURL(UploadedImage); // convert to base64

    reader.onloadend = () => {
       // result: "data:image/jpeg;base64,..."
        //console.log(reader.result)
        const base64Image = reader.result.split(",")[1];
        console.log("✅ Base64 ready:", base64Image);
        
        fetch("https://api.plant.id/v2/identify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Api-Key": apiKey // Replace with your actual API key
            },
            body: JSON.stringify({ // stringy the sent data 
              images: [base64Image], // image string
              modifiers: ["crops_fast", "similar_images"], // asking AI to send fast responsd
              plant_language: "en", // language
              plant_details: ["common_names",
                            "url",
                            "wiki_description",
                            "taxonomy",
                            "rank",
                            "gbif_id",
                            "inaturalist_id",
                            "image",
                            "synonyms",
                            "edible_parts",
                            "watering",
                            "propagation_methods"
                        ],
              health: true,
            })
          })
              .then(res => res.json())
              .then(data=>{
                console.log(data);
                // show all the suggested plants matching
                // img,name,wiki url.
                result.innerHTML = "";
                next.innerHTML = "";
                if(data && data.suggestions && data.suggestions.length > 0){
                   var plantsListHeading =  document.createElement('h3');
                   result.append(plantsListHeading);
                   plantsListHeading.innerHTML = `number of the plants found are ${data.suggestions.length}`
                   let plantLists = data.suggestions
                   
                   plantLists.forEach((plantList,index)=>{
                    var plantName= document.createElement('p');
                    plantName.innerHTML = `<strong>${index+1}</strong>, name: ${plantList.plant_details.common_names[0]},${plantList.plant_details.common_names[1]}`
                    var plantimg = document.createElement('img');
                    plantimg.alt = "Similar plant";
                    plantimg.style.width = "200px";
                    plantimg.style.height = "200px";
                    plantimg.style.borderRadius = "8px";
                    plantimg.src =plantList.plant_details.image.value;
                    var plantDis =  document.createElement('p');
                    plantDis.innerHTML = plantList.plant_details.wiki_description.value;
                    var planturl =  document.createElement('a');
                    planturl.href = plantList.plant_details.url;
                    planturl.textContent = "Click ME - See More Details"; 
                    planturl.target = "_blank";   
                    var selectfromPlantList = document.createElement("button");
                    selectfromPlantList.textContent = plantList.plant_details.common_names[0];
                    query = plantList.plant_details.common_names[0];
                    next.append( plantName)
                    next.append(plantimg)
                    next.append(plantDis)
                    next.append(planturl)
                    next.append(selectfromPlantList)

                    selectfromPlantList.addEventListener("click",()=>{
                        query
                        if (!query) return alert("Please enter a plant name!");
                        result.innerHTML = "";
                        next.innerHTML = "";
                        fetchAllPlants();
                    })
                   
                   })
                }
                })
    };}// converts the image and fetches all the info and on selecting selects a specific plant

nextbtn.addEventListener("click",() => {
    count++;
  updatePlantState();
})
prevbtn.addEventListener("click",() => {
   count--;
   updatePlantState();
})
 
function fetchAllPlants() {
    result.innerHTML ="";
    next.innerHTML = "";

    result.innerHTML = "🔍 Searching.....";
    
    fetch(`https://plant.id/api/v3/kb/plants/name_search?q=${encodeURIComponent(query)}`, {
        headers: {
            "Api-Key": apiKey,
            Accept: "application/json"
        }
        })
        .then(res => res.json())
        .then(data => {
            if (data.entities.length) {
                let newAccessTokens = [];

                for(i=0;i<data.entities.length;i++){
                    const plant = data.entities[i];
                    const accessToken = plant.access_token;
                    newAccessTokens.push(accessToken);
                }

                arraccestokens = newAccessTokens;
                count = 0;
                updatePlantState();

            } else {
                console.log("No plants found")
                result.innerHTML = " NO Plants Found "
            }
        }).catch(err => {
            console.error("Error:", err);
            document.getElementById("result").innerHTML = `❌ ${err.message}`;
          });
}

function updatePlantState (){
    PlantObj = {
        name: [], // array
        description: "",
        img: "",
        Edible_Parts:"",// array
        watering: null,
        propagation_methods: [],// array
        best_watering: "",
        best_light_condition: "",
        best_soil_type: "",
        common_uses: "",
        Toxicity:"",
        cultural_significance: "",
        gpt:[],// array
    };

    fetch(`https://plant.id/api/v3/kb/plants/${arraccestokens[count]}?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods,best_watering,best_light_condition,best_soil_type,common_uses,toxicity,cultural_significance,gpt`,{
        headers: {
            "Api-Key": apiKey,
            Accept: "application/json"
        }  
    })
    .then(res => res.json())
    .then(detail =>{
        // update state

        result.innerHTML ="";
        next.innerHTML = "";
    
        if (detail.common_names.length > 1) {
            PlantObj.name = detail.common_names.join(", ");
           }else{
            PlantObj.name = detail.common_names[0];
        } 

        if (detail.description !== null){
            PlantObj.description = detail.description.value;
        }
        
        if(detail.common_uses !== null){
            PlantObj.common_uses = detail.common_uses;
            // var common_uses = document.createElement('p');
            // result.append(common_uses);
            // common_uses.innerHTML ='<strong>Common use: </strong>'+data.common_uses; 
        }
        if(detail.Edible_Parts !== null){
            PlantObj.Edible_Parts = PlantObj.Edible_Parts;;
        }
        if (detail.image.value !== null){
            PlantObj.img = detail.image.value; // 👈 Make sure 'data.image.url' is the correct path
        }
        if(detail.toxicity !== null){
            PlantObj.Toxicity = detail.toxicity;
        }
        if(detail.watering !== null){
            PlantObj.watering = {
                minLevel: detail.watering.min,
                maxLevel: detail.watering.max
            }
        }
        if(detail.best_watering){
         PlantObj.best_watering = detail.best_watering;
        }
        if(detail.best_light_condition){
           PlantObj.best_light_condition = detail.best_light_condition;
        }
        if(detail.best_soil_type){
            PlantObj.best_soil_type = detail.best_soil_type; 
        }
        if(detail.gpt.length > 1){
            PlantObj.gpt = detail.gpt.join(", ");  
        }else{
            PlantObj.gpt = detail.gpt[0];  
        }
        if (detail.propagation_methods !== null && detail.propagation_methods.length > 0) {
            const propagationDescriptions = {
              cuttings: "✂️ Cut a piece of stem or root and place it in soil or water to grow. Used for: Azalea, Ficus, Hibiscus.",
              division: "🌱 Divide the plant into sections and replant. Common for: Asters, garlic, chives.",
              grafting: "🌿 Join parts from different plants so they grow as one. Used in: roses, apples, citrus.",
              seeds: "🌾 Grow from seeds sewn in soil. Works for: Ficus, chamomile, rose.",
              spores: "🍄 Use spores instead of seeds. Applies to: ferns, mosses.",
              suckers: "🌿 Separate new shoots from the base and plant them. Example: strawberries, lilac."
            };
            detail.propagation_methods.map(method => {
                PlantObj.propagation_methods.push(propagationDescriptions[method] || `🔸 ${method}`) ;
            });
        }
        if(detail.cultural_significance){
            PlantObj.cultural_significance = detail.cultural_significance;
        }
    
       console.log("PlantObj is: ",PlantObj);
        // rendering dom
        renderPlantDetails();
    }).catch(err => {
        console.error("Error:", err);
        document.getElementById("result").innerHTML = `❌ ${err.message}`;
      });
}

function renderPlantDetails() {
    result.innerHTML = " 🪴 Plants Fetched";
    result.innerHTML ="";
    next.innerHTML = "";

    
    if (PlantObj.name !== "") {
        var name = document.createElement('p');
        name.innerHTML ='<strong>Name:</strong>' +PlantObj.name;
        result.append(name);
    }
    
    if (PlantObj.img !== "") {
        // render image
        var img = document.createElement('img');
        img.src = PlantObj.img;
        img.alt = PlantObj.entity_name || "Plant image";
        result.append(img);
    }

    if (PlantObj.description !== "") {
        var descriptionheading = document.createElement("h3")
        var description = document.createElement("p")

        descriptionheading.innerHTML = "🪴 Description "
        description.innerHTML = PlantObj.description;

        result.append(descriptionheading);
        result.append(description);
    }
    if(PlantObj.common_uses !== ""){
        var common_uses = document.createElement('p');
        common_uses.innerHTML ='<strong>Common use: </strong>'+PlantObj.common_uses; 
        result.append(common_uses);
        
    }
    if(PlantObj.cultural_significance !== ""){
        var cultural_significance = document.createElement('p');
        cultural_significance.innerHTML ='<strong>Cultural Significance </strong>'+PlantObj.cultural_significance; 
        result.append(cultural_significance);
    }
    if(PlantObj.Toxicity !== ""){
        var toxicity = document.createElement('p');
        result.append(toxicity);
        toxicity.innerHTML ='<strong>Toxicity: </strong>'+PlantObj.Toxicity; 
    }

    var careTips = document.createElement('h3')
    result.append(careTips)
    careTips.innerHTML = " 🌿 CARE TIPS"
    
    if (PlantObj.watering !== null && PlantObj.watering.minLevel !== null && PlantObj.watering.maxLevel !== null ) {
        const wateringScale = {
          1: { text: "dry", emoji: "💧" },
          2: { text: "medium", emoji: "💧💧" },
          3: { text: "wet", emoji: "💧💧💧" }
        }
        const watering = document.createElement("p");
        result.append(watering);
        if (PlantObj.watering.minLevel === PlantObj.watering.maxLevel) {
            // Fixed watering preference
            watering.innerHTML = `Watering needs: <strong>${wateringScale[PlantObj.watering.minLevel].text}</strong> ${wateringScale[PlantObj.watering.minLevel].emoji}`;
          } else {
            // Range of watering needs
            watering.innerHTML = `Watering needs: <strong>${wateringScale[PlantObj.watering.minLevel].text}</strong> to <strong>${wateringScale[PlantObj.watering.maxLevel].text}</strong> (${wateringScale[PlantObj.watering.minLevel].emoji}–${wateringScale[PlantObj.watering.maxLevel].emoji})`;
          }
    }
    if(PlantObj.best_watering !== ""){
        var wateringPrac = document.createElement('p')
        wateringPrac.innerHTML ='<strong>💧 watering condition: </strong>' +PlantObj.best_watering;
        result.append(wateringPrac);
       }

    //best_light_condition
    if(PlantObj.best_light_condition !== ""){
        var best_light_condition = document.createElement('p');
        best_light_condition.innerHTML ='<strong>☀️ Best Light Condition: </strong>'+PlantObj.best_light_condition;
        result.append(best_light_condition);
    }
    //best_soil_type
    if(PlantObj.best_soil_type !== ""){
        var best_soil_type = document.createElement('p');
        best_soil_type.innerHTML ='<strong>🪴 Best Soil Type: </strong>'+PlantObj.best_soil_type;
        result.append(best_soil_type); 
    }
    // gpt
     if(PlantObj.gpt !== ""){
        var gpt = document.createElement('p');
         gpt.innerHTML ='<strong>Categories to which the plant belongs: </strong>'+PlantObj.gpt; 
         result.append(gpt); 
     }
     
     
    if(PlantObj.Edible_Parts !== ""){
        var edibleheading = document.createElement('h3');
        result.append(edibleheading)
        edibleheading.innerHTML = "Edible Parts"
        var edibleParts = document.createElement('p');
        result.append(edibleParts)
        edibleParts.innerHTML = PlantObj.Edible_Parts;
    }
    if(PlantObj.propagation_methods.length > 0){
        const PropagationHeading = document.createElement('h3');
        PropagationHeading.innerHTML = "🧪 Propagation Methods";
        result.append(PropagationHeading);

        PlantObj.propagation_methods.forEach((ele,i) =>{
            var par = document.createElement('p');
            result.append(par);
            par.innerHTML =  PlantObj.propagation_methods[i];
        })
    }
    document.getElementById("next").append(nextbtn)
    document.getElementById("next").append(prevbtn)
    result.append(prevbtn);
    result.append(nextbtn);
   
    }
   

