const emailReceiver = 'davi@davidsuryaardi.com'

function submitForm() {
    let name = document.getElementById('input-name').value
    let email = document.getElementById('input-email').value
    let number = document.getElementById('input-number').value
    let subject = document.getElementById('select-subject').value
    let message = document.getElementById('input-message').value

    if(name == '') {
        alert('Nama masih kosong')
    }
    if(email == ''){
        alert('Email masih kosong')
    }
    if(number == ''){
        alert('Nomor handphone masih kosong')
    }
    if(subject == ''){
        alert('Subject harus dipilih')
    }
    if(message == ''){
        alert('Pesan masih kosong')
    }

    console.log(name)
    console.log(email)
    console.log(number)
    console.log(subject)
    console.log(message)

    let a = document.createElement('a')
    a.href = `mailto:${emailReceiver}?subject=${subject}&body=Hello my name ${name}, ${message}`
    a.click()
}