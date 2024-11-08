window.onload = (e) => {document.getElementById('searchButton').onclick = onClick};

async function onClick()
{
    console.log("Button Clicked")
    let pokemonName = document.getElementById('searchterm').value.trim().toLowerCase();
    let generation = document.getElementById('generation');
    let infoType = document.getElementById('information').value;
    let status = document.getElementById('status');
    let output = document.getElementById('output');

    let generationURL = "https://pokeapi.co/api/v2/generation/"+generation.value+"/";
    let pokemonURL =  await getGenerationData(generationURL,pokemonName);
    if (pokemonURL == null)
    {
        status.innerHTML= pokemonName+" was not found. Did you spell it right and are you in the right generation?";
        output.innerHTML = "";
        console.log("inncorrect pokemon")
        return;
    }
    status.innerHTML = "You chose " + pokemonName + "!";

    if(infoType=="stats")
    {
        let statsURL = "https://pokeapi.co/api/v2/pokemon/" + pokemonName + "/";
        let statsObj = await getStats(statsURL);
        let baseStats = statsObj.stats;
        let typeArr = statsObj.types;
        output.innerHTML = "<b>Types:</b> ";
        for (let i = 0; i < typeArr.length; i++)
            {
                output.innerHTML += typeArr[i].type.name + "<br>";
            }
        output.innerHTML += "<br>"
        for (let i = 0; i < baseStats.length; i++)
        {
            output.innerHTML+= "<b>"+ baseStats[i].stat.name + ":</b> " + baseStats[i].base_stat + "<br>";
        }
        
    }
    else
    {
        let evolutionURL = await getToEvolutionData(pokemonURL)
        let evolutionObj = await getEvolutionData(evolutionURL);
        let evolvesTo = evolutionObj.chain.evolves_to;
        if (evolvesTo.length>0)
        {
            output.innerHTML = "<h2>Evolves To: <h2>";
            displayEvolution(evolvesTo,output,pokemonName);
        }
        else
        {
            output.innerHTML = "<h2>There is no evolution for this pokemon.<h2>";
        }
        
        
    }

}

async function getGenerationData(generationURL, pokemonName)
{
    try 
    {
        let response = await fetch(generationURL);
        let obj = await response.json();
        for (let i = 0; i < obj.pokemon_species.length; i++)
        {
            if (obj.pokemon_species[i].name === pokemonName)
            {
                return obj.pokemon_species[i].url;
            }
        }
        return null;
    }
    catch (error)
    {
        console.log("getGenerationData error");
        return null;
    }
}

async function getStats(statsURL)
{
    try 
    {
        let response = await fetch(statsURL);
        let obj = await response.json();
        return obj;
    }
    catch (error)
    {
        console.log("getStats error");
        return null;
    }
}

async function getToEvolutionData(pokemonURL)
{
    try 
    {
        let response = await fetch(pokemonURL);
        let obj = await response.json();
        return obj.evolution_chain.url;
    }
    catch (error)
    {
        console.log("getToEvolutionData error");
        return null;
    }
}


async function getEvolutionData(evolutionURL)
{
    try 
    {
        let response = await fetch(evolutionURL);
        let obj = await response.json();
        return obj;
    }
    catch (error)
    {
        console.log("getEvolutionData error");
        return null;
    }
}

function displayEvolution(evolvesTo, output, pokemonName)
{
    
}

function dataError(e)
{
    console.log("An error occured");
}

//stuff for xhr----------------------------------------

// function generationLoaded(e)
// {
//     let xhr = e.target;

//     console.log(xhr.responseText);

//     let obj = JSON.parse(xhr.responeText);

//     for (let i = 0; i < obj.pokemon_species.length; i++)
//     {
//         if (obj.pokemon_species[i].name == pokemonName)
//         {
//             return obj.pokemon_species[i].url;
//         }
//     }
// }

// function statsLoaded(e)
// {
//     let xhr = e.target;
//     console.log(xhr.responseText);
//     let obj = JSON.parse(xhr.responeText);
//     return obj;
// }

// function pokemonToEvolutionLoaded(e)
// {
//     let xhr = e.target;
//     console.log(xhr.responseText);
//     let obj = JSON.parse(xhr.responeText);
//     return obj.evolution_chain.url;
// }

// function evolutionLoaded(e)
// {
//     let xhr = e.target;
//     console.log(xhr.responseText);
//     let obj = JSON.parse(xhr.responeText);
//     return obj;
// }