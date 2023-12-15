const express = require('express');
const router = express.Router();

const fetchUser = require('../middleware/fetchUser.js');
const Note = require('../models/Note.js');


// ROUTE 1: Get all notes using GET "/api/notes/getAllNotes" Login is required
router.get('/getAllNotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// ROUTE 2: Create a new note using: "/api/notes/addNote" Login is required
router.post('/addNote', fetchUser, async (req, res) => {
    try {
        //destructure the info sent from req.body
        const { title, description, tag } = req.body;

        //create a note object with the information sent via req.body
        const note = new Note({
            title, description, tag, user: req.user.id
        })

        //save the note object
        const savedNote = await note.save();

        //send savedNote obj
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 3: Edit an existing note using PUT "/api/notes/updateNote" Login is required
router.put('/updateNote/:id', fetchUser, async (req, res) => {
    try {
        //deconstruct the req.body
        const { title, description, tag } = req.body;
        //create a new note object first we keep it empty later we'll update the required fields only
        const newNote = {};
        if (title) { newNote.title = title;}
        if (description) { newNote.description = description;}
        if (tag) { newNote.tag = tag;}

        //find the note to be updated
        let note = await Note.findById(req.params.id);

        //if no note with the requested id exists return error
        if(!note){return res.status(404).send("Note not found")};
        //if the note id provided does not belong to the current user send error
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        //After passing all the checks we can finally update the note
        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});
        res.json({note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// ROUTE 4: Delete an existing note using Delete "/api/notes/deleteNote/:id" Login is required
router.delete('/deleteNote/:id', fetchUser, async (req, res) => {
    try {
        //find the note to be deleted
        let note = await Note.findById(req.params.id);

        //if no note with the requested id exists return error
        if(!note){return res.status(404).send("Note not found")};
        //if the note id provided does not belong to the current user send error
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        //After passing all the checks we can finally delete the note
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({"Success":"Note has been deleted", note: note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})


module.exports = router