'use strict';

let page_routes = {
    "/": "index.html",
    "/login": "login.html",
    "/dashboard": "dashboard.html"
}

module.exports = (ref) => {
    var noop = (req, res) => req.next();

    var ret = {
        "/api/login": [noop,
            (req, res) => {
                let body = "";
                req.on('data', (chunk) => {
                    body += chunk;
                });
                req.on('end', () => {
                    try {
                        body = JSON.parse(body);
                        i.util.login(body);
                        res.end(200);
                    } catch (e) {
                        res.end(1001);
                    }
                });
            }],
        "/api/googleoauthcallback": [
            (req, res) => {
                let code;
                if (/googleoauthcallback\?code=/.test(req.url)) {
                    code = req.url.substr(req.url.find("?code=")+6);
                    console.log("code from oauth callback: ", code);
                    const {tokens} = oauth2Client.getToken(code);
                    console.log(tokens);
                }
            }
        ],
        "/api/getprivate": [noop,
            (req, res) => {
                req.body = JSON.parse(req.body);
                // pwd for $2b$14$3xzYQBfhdN0EPHYdM2/u7.oUISDHAMDa9RPTT48fqsuQJIdMA0cu2 is johny
                ref.util.authenticate(req.body)
                .then((r) => {
                    return new Promise((rs, rj) => {
                        console.log("authenticate finished: " + r);
                        if (r) res.end(JSON.stringify(ref.data[req.body.usr].private)); // todo: get data from database and return the json.stringify
                        else {
                            res.status(403).send("wrong_pass");
                        }
                        rs(r);
                    });
                }).catch(v => {res.status(403).end(); console.error(v); return Promise.resolve()});
            }
        ],
        "/api/getpublic": [noop,
            (req, res) => {
                req.body = JSON.parse(req.body);
                if (! ref.data.hasOwnProperty(req.body.usr)) return res.status(403).send("wrong_user");
                res.end(JSON.stringify(ref.data[req.body.usr].public));
            }
        ],
        "/api/play/pushscore": [noop,
            (req, res) => {
                req.body = JSON.parse(req.body);
                if (req.body.amnt > ref.config.play.click.max)
                {
                    req.body.amnt *= -1;
                    res.status(400).end();
                }
                
            }
        ]
    };

    for (let p in page_routes) {
        ret[p] = [(req, res) => { return res.sendFile(ref.path + ref.config.app.pages_location + page_routes[p]); }, noop]
    }

    return ret;
};