const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
// DATABASE
const db = require('./connection/db');
// Multer
const upload = require('./middlewares/uploadFile'); // Connect to Multer

// check db con
db.connect(function (err, _, done) {
  if (err) throw err;

  console.log('Database has Connected');
  done();
});

const app = express();
const PORT = 8888;

// Boolean => true/false
const isLogin = true;//

let projects = [];

app.set('view engine', 'hbs');
app.use(flash()); // flash alert

// session
app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
})) 

app.use('/public', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads')); // visible dir to client

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {

  db.connect(function (err, client, done) {

    let query = '';
    if (req.session.isLogin) {
      query = `SELECT tb_projects.*, tb_user.id AS "user_id", tb_user.name, tb_user.email 
                FROM tb_projects LEFT JOIN tb_user 
                ON tb_user.id = tb_projects.author_id WHERE tb_user.id=${req.session.user.id} ORDER BY tb_projects.id ASC`;
    } else {
      query = `SELECT tb_projects.*, tb_user.id AS "user_id", tb_user.name, tb_user.email 
                FROM tb_projects LEFT JOIN tb_user 
                ON tb_user.id = tb_projects.author_id ORDER BY tb_projects.id ASC`;
    }

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      let data = result.rows;

      //Looping
      let dataProject = data.map(function (data) {

        let user_id = data.user_id;
        let name = data.name;
        let email = data.email;

        delete data.user_id;
        delete data.name;
        delete data.email;
        delete data.author_id;

        const PATH = 'http://localhost:8888/uploads/';

        return{
          time: getDuration(data.startdate, data.enddate),
          isLogin: req.session.isLogin,
          ...data,
          author: {
            user_id,
            name,
            email,
          },
          isLogin: req.session.isLogin,
          image: PATH + data.image,
        };
      });

      res.render('index', {
        user: req.session.user, 
        isLogin: req.session.isLogin, 
        projects: dataProject,
      });
    });
  });
});

app.get('/my-project', function (req, res) {
  res.render('my-project', {user: req.session.user, isLogin: req.session.isLogin});
});

app.get('/project-detail/:id', function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done){
    const query = `SELECT tb_projects.*, tb_user.id AS "user_id", tb_user.name, tb_user.email 
                    FROM tb_projects LEFT JOIN tb_user 
                    ON tb_user.id = tb_projects.author_id 
                    WHERE tb_projects.id=${id}`;

    client.query(query, function (err,result) {
      if (err) throw err;
      done();

      let data = result.rows[0];

      const PATH = 'http://localhost:8888/uploads/';

      data = {
          time: getDuration(data.startdate, data.enddate),
          isLogin,
          ...data,
          timefull : getFullTime(data.startdate),
          timefull2 : getFullTime(data.enddate),
          author: {
            user_id: data.user_id,
            name: data.name,
            email: data.email,
          },
          image: PATH + data.image,
      };

      delete data.user_id;
      delete data.name;
      delete data.email;
      delete data.author_id;


      res.render('project-detail', {user: req.session.user, isLogin: req.session.isLogin, project: data });
    });
  });
});

app.post('/my-project', upload.single('image'), function (req, res) {

  let data = req.body;
  if (data.projectName == '' || data.startdate == '' || data.enddate == '' || data.description == '') {
    return res.redirect('/my-project')
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_projects(projectname, startdate, enddate, description, image, nodejs, reactjs, nextjs, typescript, author_id) VALUES('${data.projectname}','${data.startdate}','${data.enddate}','${data.description}','${req.file.filename}',${checkboxRender(data.nodejs)},${checkboxRender(data.reactjs)},${checkboxRender(data.nextjs)},${checkboxRender(data.typescript)},${req.session.user.id})`;

    client.query(query, function (err, result) {
        if (err) throw err;
        done();
      });
  });

  res.redirect('/');
});

app.get('/project-delete/:id', function (req, res) {
  let id = req.params.id;
  
  db.connect(function (err,client, done) {
    if (err) throw err;
    const query =`DELETE FROM tb_projects WHERE id=${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();
    });
  });

  res.redirect('/');
});

app.get('/contact', function (req, res) {
  res.render('contact');
});

app.get('/update-project/:id', function (req, res) {
  let id = req.params.id;
  db.connect(function(err,client,done){
    if(err) throw err;
    const query =`SELECT * FROM tb_projects WHERE id=${id}`;

    client.query(query,function(err, result) {
      if(err)throw err;

      let data = result.rows[0];
      const PATH = 'http://localhost:8888/uploads/';

      data = {
        isLogin,
        ...data,
        startdate:renderDate(data.startdate),
        enddate:renderDate(data.enddate),
        image: PATH + data.image,
        nodejs:viewCheck(data.nodejs),
        nextjs:viewCheck(data.nextjs),
        reactjs:viewCheck(data.reactjs),
        typescript:viewCheck(data.typescript),
      }
      // console.log(data);

      res.render('update-project', {user: req.session.user, isLogin: req.session.isLogin, project:data});
      done();
    })
  })

});

app.post('/update-project/:id', upload.single('image'), function (req, res) {
  let id = req.params.id;

  let {projectname, startdate, enddate, description, nodejs, reactjs, nextjs, typescript} = req.body;

  let uploadProject = {
    projectname, 
    startdate, 
    enddate, 
    description, 
    nodejs, 
    reactjs, 
    nextjs, 
    typescript
  }

  // console.log(uploadProject)
  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `UPDATE tb_projects SET projectname='${uploadProject.projectname}', startdate='${uploadProject.startdate}', enddate='${uploadProject.enddate}', description='${uploadProject.description}', image='${req.file.filename}', nodejs='${checkboxRender(uploadProject.nodejs)}', reactjs='${checkboxRender(uploadProject.reactjs)}', nextjs='${checkboxRender(uploadProject.nextjs)}', typescript='${checkboxRender(uploadProject.typescript)}' WHERE id=${id}`;


    client.query(query, function (err, result) {
        if (err) throw err;
        done();
        res.redirect('/');
      });
  });
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function (req, res) {
  const data = req.body;

  if (data.name == '' || data.email == '' || data.password == '') {
    req.flash('error', 'Please insert all field!');
    return res.redirect('/register');
  }

  const hashedPassword = bcrypt.hashSync(data.password, 10);

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_user(name,email,password) VALUES ('${data.name}','${data.email}','${hashedPassword}')`;

    client.query(query, function (err, result) {
      if (err) throw err;

      req.flash('success', 'Success register your account!');
      res.redirect('/login');
    });
  });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res) {
  const data = req.body;

  if (data.email == '' || data.password == '') {
    req.flash('error', 'Please insert all field!');
    return res.redirect('/login');
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;

    client.query(query, function (err, result) {
      if (err) throw err;

      // Check account by email
      if (result.rows.length == 0) {
        console.log('Email not found!');
        return res.redirect('/login');
      }

      // Check password
      const isMatch = bcrypt.compareSync(
        data.password,
        result.rows[0].password
      );

      if (isMatch == false) {
        console.log('Wrong Password!');
        return res.redirect('/login');
      }

      req.session.isLogin = true;
      req.session.user = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
      };

      res.redirect('/');
    });
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT: ${PORT}`);
});

// Duration
function getDuration(startDateProject, endDateProject) {

  // Declare day, month, year
  let time = new Date(endDateProject) - new Date(startDateProject)
  let days = time / (24 * 3600 * 1000)
  let month = 30
  let years = month * 12

  // Math of endDate and startDate
  let dayDistance = Math.floor((days % years) % month) % 7
  let weekDistance = Math.floor(((days % years) % month) / 7)
  let monthDistance = Math.floor((days % years) / month)
  let yearDistance = Math.floor(days / years)

  // Display to innerHTML
   let duration ="";
   if (yearDistance > 0) {
     duration += yearDistance + " tahun ";
      } if (monthDistance > 0) {
        duration += monthDistance + " bulan ";
      } if (weekDistance > 0) {
        duration += weekDistance + " minggu ";
      } if (dayDistance > 0) {
        duration += dayDistance + " hari ";
      }
   return duration;
}

function getFullTime(time) {
  let month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let date = time.getDate();
  let monthIndex = time.getMonth();
  let year = time.getFullYear();
  
  let fullTime = `${date} ${month[monthIndex]} ${year}`;

  return fullTime;
}


//function check checkbox
function checkboxRender(tick) {
  if (tick == "true") {
      return true
  } else if (tick != true) {
      return false
  }
}

//function form
function viewCheck(form) {
  if (form == true) {
      return 'checked'
  } else if (form != true) {
      return ""
  }
}

// function render date

function renderDate(formtime) {

    let hari = [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
    ]

    let bulan = [
        "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
    ]

    let date = formtime.getDate();
    let monthIndex = formtime.getMonth();
    let year = formtime.getFullYear();

    let fullTime = `${year}-${bulan[monthIndex]}-${hari[date]}`;

    return fullTime;
}