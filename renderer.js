const btn = document.getElementById("btn1")
btn.addEventListener("click", () => {btn.textContent = "Changed!"})

const resizeBtn = document.getElementById("resizeBtn")
resizeBtn.addEventListener("click", () => { resizeBtn.textContent = "Sike!!... this feature does not work yet!" })

const information = document.getElementById("info")
information.innerText = `This app is using Chrome(v${versions.chrome()}), Node.js(v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
    const response = await window.versions.ping()
    console.log(response) // prints out 'pong'
}

func()