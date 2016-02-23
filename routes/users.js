var express = require('express');
var router = express.Router();
var fs = require("fs");
var storedSecrets;
var secretsDirectory = "./";

/* GET users listing. */

router.get('/secrets', function (req, res, next) {
    try {
        storedSecrets = JSON.parse(fs.readFileSync("./secrets.json", "utf8"));
    } catch (error) {
        console.log("You are in development mode");
        secretsDirectory = "./bin/";
        storedSecrets = JSON.parse(fs.readFileSync("./bin/secrets.json", "utf8"));
    }
    res.render('secrets', { username: req.cookies.username, secrets: storedSecrets });
});

router.post('/secrets/modifySecrets', function (req, res, next) {
    console.log(req.body.submit);

    if (req.body.submit == "Delete this Secret") {
        console.log("\n User wants to delete a secret. SecretId = " + req.body.secretId + "\n");
        for (var i = 0; i < storedSecrets.length; i++) {
            if (storedSecrets[i].secretId == req.body.secretId) {
                storedSecrets.splice(i, 1);
            }
        }
    } else if (req.body.submit == "Keep my Secret") {
        console.log("\nNew Secret Recieved: " + req.body.secretTitle + "\n");
        var newSecret = { secretTitle: req.body.secretTitle, secret: req.body.secret, secretId: (new Date).getTime() };
        storedSecrets.push(newSecret);
    }

    storedSecrets.sort(function (a, b) {
        var answer = 0;
        if (req.cookies.sortByDate == "true") {
            console.log("\nSorting By DATE");
            var numberA = parseInt(a.secretId);
            var numberB = parseInt(b.secretId);
            answer = numberA - numberB;
        } else {
            console.log("\nSorting By TITLE");
            var titleA = a.secretTitle.toLowerCase();
            var titleB = b.secretTitle.toLowerCase();
            if (titleA.secretTitle > titleB.secretTitle) {
                answer = 1;
            } else if (titleA.secretTitle < titleB.secretTitle) {
                answer = -1;
            }
        }
        return answer;
    });

    res.redirect("/users/secrets");

    fs.writeFile(secretsDirectory + "secrets.json", JSON.stringify(storedSecrets), "utf8", function (err) {
        if (err) {
            console.log("\nFailed to save secrets " + err + "\n");
        }
        else {
            console.log("\nSecrets successfully saved :)\n");
        }

        console.log("\nSecrets Reloaded\n");
    });
});

module.exports = router;
