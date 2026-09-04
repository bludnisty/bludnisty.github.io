const DIR_GIFS = "storage/gif"
const DIR_STORAGE = "storage/storage.js"
const STORAGE_PREFIX = "const DATA = `"
const STORAGE_SUFFIX = "`"

const { spawn } = require('child_process')
const express = require('express')
const fs = require("fs")
const path = require('path')
const app = express()
const port = 3000

app.use(express.urlencoded({
    extended: true
}))

app.use(express.static("storage/gif"))

app.get('/', (req, res) => {
    let gif_files = fs.readdirSync(DIR_GIFS)
    let current_storage = fs.readFileSync(DIR_STORAGE).toString().slice(STORAGE_PREFIX.length, -STORAGE_SUFFIX.length)
    if (current_storage == "" || !JSON.parse(current_storage))
        current_storage = []
    else
        current_storage = JSON.parse(current_storage)

    let result = fs.readFileSync("storage_manager/assets/index.html").toString()

    let files_in_storage = []
    let in_storage_rows = ""
    current_storage.forEach((gif) => {
        let row = fs.readFileSync("storage_manager/assets/gif_row.html").toString()

        row = row.replaceAll("{{filename}}", gif.filename)
        row = row.replace("{{tags}}", gif.tags)
        row = row.replace("{{nsfw}}", gif.nsfw ? "checked" : "")
        row = row.replace("{{racist}}", gif.racist ? "checked" : "")
        row = row.replace("{{gore}}", gif.gore ? "checked" : "")

        in_storage_rows += row
        files_in_storage.push(gif.filename)
    })

    let files_not_in_storage = gif_files.filter(item => !files_in_storage.includes(item))
    let not_in_storage_rows = ""
    files_not_in_storage.forEach((file) => {
        let row = fs.readFileSync("storage_manager/assets/gif_row.html").toString()

        row = row.replaceAll("{{filename}}", file)
        row = row.replace("{{tags}}", "")
        row = row.replace("{{nsfw}}", "")
        row = row.replace("{{racist}}", "")
        row = row.replace("{{gore}}", "")

        not_in_storage_rows += row
    })

    result = result.replace("{{in_storage}}", in_storage_rows)
    result = result.replace("{{not_in_storage}}", not_in_storage_rows)
    result = result.replace("{{in_storage_count}}", files_in_storage.length)
    result = result.replace("{{not_in_storage_count}}", files_not_in_storage.length)
    if (not_in_storage_rows == "")
        result = result.replaceAll("{{hide}}", `style="display: none"`)

    res.type("html")
    res.send(result)
})

app.post("/save_storage", (req, res) => {
    let data = req.body

    let files = []
    Object.keys(data).forEach(filename => {
        values = data[filename]

        if (values.tags.trim() == "")
            return

        let file = {
            filename: filename,
            tags: values.tags,
            nsfw: values.nsfw == undefined ? false : true,
            racist: values.racist == undefined ? false : true,
            gore: values.gore == undefined ? false : true
        }
        files.push(file)
    })

    files.sort((a, b) => {
        if (a.filename < b.filename)
            return -1
        else if (a.filename > b.filename)
            return 1
        return 0
    })

    files_json = JSON.stringify(files)
    fs.writeFileSync(DIR_STORAGE, STORAGE_PREFIX + files_json + STORAGE_SUFFIX)

    res.redirect("\\")
})

app.post("/rename_file", (req, res) => {
    let old_name = req.body.old_filename
    let new_name = req.body.new_filename

    if (old_name == new_name) {
        res.send("to samo gowienko")
        return
    }

    let storage = fs.readFileSync(DIR_STORAGE).toString()
    storage = storage.replaceAll(old_name, new_name)

    fs.renameSync(`${DIR_GIFS}/${old_name}`, `${DIR_GIFS}/${new_name}`)
    fs.writeFileSync(DIR_STORAGE, storage)

    res.redirect("\\")
})

app.post("/delete_file", (req, res) => {
    let filename = req.body.filename
    
    let storage = fs.readFileSync(DIR_STORAGE).toString().slice(STORAGE_PREFIX.length, -STORAGE_SUFFIX.length)
    storage = JSON.parse(storage)

    let files = []
    storage.forEach((gif) => {
        if (gif.filename != filename)
            files.push(gif)
    })

    files = JSON.stringify(files)

    fs.writeFileSync(DIR_STORAGE, STORAGE_PREFIX + files + STORAGE_SUFFIX)
    fs.rmSync(`${DIR_GIFS}/${filename}`)

    res.redirect("\\")
})

app.get("/explorer", (req, res) => {
    const fn = req.query.fn
    const dir = path.resolve(DIR_GIFS, fn)
    spawn('explorer.exe', [`/select,"${dir}"`], {shell: true})
    res.send("<script>window.close()</script>")
})

app.listen(port, () => console.log(`Storage Manager started. Open: http://localhost:${port}`))

// app.get("/format", (req, res) => {
//     let current_storage = fs.readFileSync(DIR_STORAGE).toString().slice(STORAGE_PREFIX.length, -STORAGE_SUFFIX.length)
//     current_storage = JSON.parse(current_storage)
    
//     let new_storage = []
//     current_storage.forEach((gif) => {
//         new_storage.push({
//             filename: gif.filename,
//             tags: gif.tags,
//             nsfw: gif.nsfw,
//             racist: false,
//             gore: false
//         })
//     })

//     new_storage = JSON.stringify(new_storage)
//     fs.writeFileSync(DIR_STORAGE, STORAGE_PREFIX + new_storage + STORAGE_SUFFIX)
// })
