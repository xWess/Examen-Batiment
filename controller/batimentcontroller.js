// Import the database models for Batiment (Building) and Niveau (Level/Floor)
const Batiment = require("../model/batiment");
const Niveau = require("../model/niveau");

/**
 * ADD BUILDING FUNCTION
 * This function creates a new building in the database
 * @param {Object} req - HTTP request object containing form data
 * @param {Object} res - HTTP response object to send back to client
 * @param {Function} next - Express middleware function
 */
async function addbatiment(req, res, next) {
  try {
    // Create a new building object using data from the request body
    const batiment = new Batiment({
      nom: req.body.nom, // Building name comes from user input
      description: "Batiment a Tunis", // Fixed description
      adress: "Tunis", // Fixed address
      nbr_niveau: 0, // Start with 0 levels
    });
    
    // Create a default level/floor for this building
    const niv = new Niveau({
      nom: "niveau2", // Level name
      nbr_chambre: 0, // Number of rooms (starts at 0)
      etat_construction: false, // Construction status (not built yet)
      id_batiment: "65e6f4b5346636f507b36752", // Hard-coded building ID (should be dynamic!)
    });
    
    // Save both the building and level to the database
    await batiment.save();
    await niv.save();
    
    // Send success response back to the client
    res.status(200).send("add good");
  } catch (err) {
    // If anything goes wrong, log the error
    console.log(err);
  }
}

/**
 * GET ALL BUILDINGS FUNCTION
 * This function retrieves all buildings from the database
 * NOTE: There's a bug here - it's trying to find "termet_samira" instead of "Batiment"
 */
async function getallbatiemnt(req, res, next) {
  try {
    // BUG: This should be Batiment.find() not termet_samira.find()
    const data = await termet_samira.find(); // This will cause an error!
    //return data;
    res.json(data); // Send all buildings data as JSON response
  } catch (err) {
    console.log(err);
  }
}

/**
 * CALCULATE BUILDINGS FUNCTION
 * This function counts how many buildings in Tunis have 5 or more levels
 * @returns {Number} Count of buildings meeting the criteria
 */
async function calculBatiemnt(req, res, next) {
  try {
    // Get all buildings from database
    const data = await Batiment.find();
    let i = 0; // Counter variable
    
    // Loop through each building and check conditions
    data.forEach((element) => {
      //console.log(element);
      // If building has 5+ levels AND is in Tunis, increment counter
      if (element.nbr_niveau >= 5 && element.adress == "Tunis") i++;
    });
    
    // Return the count (used by socket functions)
    return i;
  } catch (err) {
    console.log(err);
  }
}

/**
 * GET ALL LEVELS FUNCTION
 * This function retrieves all levels/floors from the database
 * @returns {Array} Array of all level objects
 */
async function getallNiveau(req, res, next) {
  try {
    // Find and return all levels in the database
    const data = await Niveau.find();
    return data;
  } catch (err) {
    console.log(err);
  }
}

/**
 * GET BUILDING BY ID FUNCTION
 * This function finds and returns a specific building using its ID
 * @param {Object} req - Request object containing the building ID in params
 */
async function getbyidbatiment(req, res, next) {
  try {
    // Find building by ID (ID comes from URL parameter)
    const data = await Batiment.findById(req.params.id); 
    res.json(data); // Send the building data as JSON
  } catch (err) {
    console.log(err);
  }
}

/**
 * DELETE BUILDING BY ID FUNCTION
 * This function removes a building from the database
 * @param {Object} req - Request object containing the building ID to delete
 */
async function deletebyidBatiment(req, res, next) {
  try {
    // Find and delete the building by its ID
    const data = await Batiment.findByIdAndDelete(req.params.id);
    res.json(data); // Send back the deleted building data
  } catch (err) {
    console.log(err);
  }
}

/**
 * DELETE LEVEL BY ID FUNCTION
 * This function removes a level/floor from the database
 * @param {Object} req - Request object containing the level ID to delete
 */
async function deletebyidniveau(req, res, next) {
  try {
    // Find and delete the level by its ID
    const data = await Niveau.findByIdAndDelete(req.params.id);
    res.json(data); // Send back the deleted level data
  } catch (err) {
    console.log(err);
  }
}
/**
 * CONSTRUCTION FUNCTION
 * This function simulates building construction by:
 * 1. Marking a level as constructed
 * 2. Incrementing the building's level count
 * @param {Object} req - Request object containing level ID to construct
 * @returns {String} Success message
 */
async function construction(req, res, next) {
  try {
    console.log(req.params.id);
    
    // Find the specific level that needs to be constructed
    const n = await Niveau.findById(req.params.id);
    console.log(n);
    
    // Find the building that this level belongs to
    const b = await Batiment.findById(n.id_batiment);
    
    // Calculate new level count (add 1 to current count)
    nbr_niveau = b.nbr_niveau + 1;

    // Update the level to mark it as constructed
    const niv = await Niveau.findByIdAndUpdate(req.params.id, {
      etat_construction: true, // Mark as built/constructed
    });
    
    // Update the building to increase its level count
    const bat = await Batiment.findByIdAndUpdate(n.id_batiment, {
      nbr_niveau: nbr_niveau, // Update total number of levels
    });
    
    return "construit"; // Return success message (French for "built")
  } catch (err) {
    console.log(err);
  }
}

// Export all functions so they can be used in other files (like routes)
module.exports = {
  addbatiment,           // Add new building
  getallbatiemnt,        // Get all buildings
  getbyidbatiment,       // Get specific building by ID
  deletebyidBatiment,    // Delete building by ID
  construction,          // Construct/build a level
  getallNiveau,          // Get all levels
  calculBatiemnt,        // Calculate building statistics
  deletebyidniveau,      // Delete level by ID
};


