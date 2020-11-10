const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-discord");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
function loginDiscord(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/auth/discord");
  next();
}

const clientID = "ClientID",
  clientSecret = "clientSecret",
  callbackURL = "callBackURI";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new Strategy({
  clientID,
  clientSecret,
  callbackURL
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    done(null, profile);
  })
}));

const cookieParser = require("cookie-parser");
//app.use(csrf());
app.use(cookieParser());

app.use(session({
  secret: "y",
  saveUninitialized: true,
  resave: false,
}));

app.get("/login", (req, res) => {
  res.redirect("/auth/discord")
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/discord", passport.authenticate("discord", {
  scope: ["identify", "guilds", "guilds.join"]
}));

app.get("/auth/discord/callback", passport.authenticate("discord", {
  failureRedirect: "/login"
}), async (req, res) => {
  res.redirect("/");
  const axios = require("axios")
  console.log(req.user.accessToken)
  await axios.put(`https://discord.com/api/v8/guilds/guild.id/members/${req.user.id}`, {access_token: req.user.accessToken}, {headers: {Authorization: `Bot ${process.env.token}`}}).catch(err => console.log(err))
});

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));



app.get("/", loginDiscord, (req, res)=> {
  res.send(req.user)
})



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
