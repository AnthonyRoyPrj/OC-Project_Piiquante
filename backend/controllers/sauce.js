const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            res.status(200).json(sauce)
        })
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    console.log(req);
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : {
        ...req.body
    };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : "Non autorisé"});
            } else {
            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: "Non autorisé"});
            } else {
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({ message: "Sauce supprimée !" }) })
                    .catch(error => res.status(401).json({ error }));
            });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    const sauceLike = req.body.like;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauceLike > 0) {
                sauce.likes += 1;
                sauce.usersLiked.push(req.body.userId);
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: "Sauce liked !" }))
                    .catch(error => res.status(401).json({ error }));
            } else if (sauceLike < 0) {
                sauce.dislikes += 1;
                sauce.usersDisliked.push(req.body.userId);
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: "Sauce disliked !" }))
                    .catch(error => res.status(401).json({ error }));
            } else {
                console.log(req.body.userId);
                if (sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes -= 1
                    sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId));
                } else {
                    sauce.dislikes -= 1;
                    sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId));
                }
                Sauce.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: "Vote annulé !" }))
                    .catch(error => res.status(401).json({ error }));
            }
            console.log(sauce);
        })
        .catch(error => res.status(500).json({ error }))
};