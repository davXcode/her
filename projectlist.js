let projects = []

function addProject() {

    let title = document.getElementById('input-project-title').value;
    let content = document.getElementById('input-description').value;
    let start = document.getElementById('input-startdate').value;
    let end = document.getElementById('input-enddate').value;
    let image = document.getElementById('input-project-image').files[0];
    let NodeJS = document.getElementById('nodejs').checked;
    let NextJS = document.getElementById('nextjs').checked;
    let ReactJS = document.getElementById('reactjs').checked;
    let Typescript = document.getElementById('typescript').checked;

    image = URL.createObjectURL(image)

    let startDate = new Date (start)
    let endDate = new Date (end)

    let project = {
        title: title,
        content: content,
        lama : startDate,
        baru : endDate,
        image: image,
        NodeJS : NodeJS,
        NextJS : NextJS,
        Typescript :Typescript,
        ReactJS : ReactJS,
    }

    projects.push(project)

    renderProject()
}


function renderProject() {

    let projectContainer = document.getElementById('contents')

    projectContainer.innerHTML = `<div class="project-post">
    <div class="project-image">
        <img src="assets/project-img.png" alt="img">
    </div>
    <div class="project-content">
        <h4>
            <a href="project-detail.html" target="_blank">Lah latihan ?</a>
        </h4>
        <span>durasi : 3 bulan</span>
    </div>
    <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Suscipit ipsum similique veniam, corrupti eaque, asperiores placeat vitae libero tempora nulla, assumenda quis sapiente. Unde velit consequatur laudantium ullam, id, vel autem voluptate reiciendis beatae reprehenderit facilis minima laboriosam doloremque. Rerum!
    </p>

    <div class="project-content-logo">
        <img src="https://img.icons8.com/ios-glyphs/30/000000/react.png"/>
        <img src="https://img.icons8.com/windows/30/000000/node-js.png"/>
        <img src="assets/nextjs.png"/>
        <img src="assets/socketio.png"/>
    </div>

    <div class="btn-group">
        <a href="#" class="btn-edit">edit</a>
        <a href="#" class="btn-edit">delete</a>
    </div>
    </div>`

    for(let i = 0; i < projects.length; i++) {
        projectContainer.innerHTML += `<div class="project-post">
        <div class="project-image">
            <img src="${projects[i].image}" alt="img">
        </div>
        <div class="project-content">
            <h4>
                <a href="project-detail.html" target="_blank">${projects[i].title}</a>
            </h4>
            <span>${getDistanceTime(projects[i].lama, projects[i].baru)} </span>
        </div>
        <p>
            ${projects[i].content}
        </p>

        <div class="project-content-logo">
            ${addCheckBox(projects[i].NodeJS, projects[i].NextJS, projects[i].ReactJS, projects[i].Typescript)}
        </div>

        <div class="btn-group">
            <a href="#" class="btn-edit">edit</a>
            <a href="#" class="btn-edit">delete</a>
        </div>
    </div>`
    }
}

function getDistanceTime(mulai, akhir) {

    let distance = akhir - mulai //placeholder

    let yearDistance = Math.floor(distance / (12 * 4 * 7 * 24 * 60 * 60 * 1000))

    if (yearDistance != 0) {
        return `${yearDistance} Tahun`
    } else {
        let monthDistance = Math.floor(distance / (4 * 7 * 24 * 60 * 60 * 1000))
        if (monthDistance != 0) {
            return `${monthDistance} Bulan`
        } else {
            let weekDistance = Math.floor(distance / (7 * 24 * 60 * 60 * 1000))
            if (weekDistance != 0) {
                return `${weekDistance} Minggu`
            } else {
                let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000))

                return `${dayDistance} Hari`
            }
        }
    }
}

function addCheckBox(ic1, ic2, ic3, ic4) {
    icon = ""
    if (ic1 == true) {
        icon += '<img src="https://img.icons8.com/windows/30/000000/node-js.png"/>'
    }
    if (ic2 == true) {
        icon += '<img src="https://img.icons8.com/ios-glyphs/30/000000/react.png"/>'
    }
    if (ic3 == true) {
        icon += '<img src="assets/nextjs.png"/>'
    }
    if (ic4 == true) {
        icon += '<img src="assets/socketio.png"/>'
    }

    return icon
}