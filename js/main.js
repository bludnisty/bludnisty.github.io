/* DOM elements */
const tooltip = document.querySelector("#tooltip")

const input_search = document.querySelector("#input-search")
const input_nsfw = document.querySelector("#input-nsfw")
const input_racist = document.querySelector("#input-racist")
const input_gore = document.querySelector("#input-gore")
const button_load_more = document.querySelector("#button-load-more")

const count = {
    results: document.querySelector("#count-results"), 
    nsfw: document.querySelector("#count-nsfw"),
    racist: document.querySelector("#count-racist"),
    gore: document.querySelector("#count-gore"),
}

const theme_button = document.querySelector("#theme-button")
const gif_container = document.querySelector("#gifs")

const theme_icons = {
    dark: `<path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>`,
    light: `<path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>`
}

let tooltipTimeout;
let all_results = [];       // all filtered gifs as objects
let one_load_limit = 40;    // how many gifs to load at a time
let load_count = 1;         // load_count * one_load_limit = amount of gifs shown

search_gifs("", handle_flags())
handle_theme()
get_gif_count()

async function search_gifs(query = "", flags = {nsfw: false, racist: false, gore: false}) {
    gif_container.innerHTML = ""
    load_count = 1

    // getting gifs
    let data = [];
    try {
        data = JSON.parse(DATA)
    } catch (e) {
        console.warn("Could not parse DATA variable.");
    }

    // cleaning query
    query = query.trim().toLocaleLowerCase()
    let query_splitted = query.split(" ")

    // sort alphabetically if no query (zeby muche schowac)
    let filtered_gifs = []
    if (query == "") {
        filtered_gifs = data.sort((a, b) => {
            if (a.filename < b.filename)
                return -1
            else if (a.filename > b.filename)
                return 1
            else
                return 0
        })
    }
    else {
        // score-based searching through gifs
        filtered_gifs = data
            .map(gif => {
                const tag_string = gif.tags.toLowerCase()
                const tags = tag_string.split(/\s+/)
    
                let score = 0
    
                // Individual word matches
                for (const word of query_splitted) {
                    if (tags.includes(word)) {
                        score += 1
                    }
                }
    
                // Exact phrase match
                if (tag_string.includes(query)) {
                    score += 5
                }
    
                return {
                    ...gif,
                    score
                }
            })
            .filter(gif => gif.score > 0)
            .sort((a, b) => b.score - a.score)
    }

    // filtering flags
    filtered_gifs = filtered_gifs
        .filter(gif => !(gif.nsfw == true && flags.nsfw == false))
        .filter(gif => !(gif.racist == true && flags.racist == false))
        .filter(gif => !(gif.gore == true && flags.gore == false))

    all_results = filtered_gifs
    display_gifs(flags)
}

function display_gifs() {
    let result_count = one_load_limit * (load_count - 1)

    let length = Math.min(one_load_limit * load_count, all_results.length)

    for (let i = one_load_limit * (load_count - 1); result_count < length; i++) {
        let gif = all_results[i]

        let element = document.createElement("img")
        element.classList.add("gif")
        element.src = `storage/gif/${gif.filename}`
        element.title = gif.tags
        element.loading = "lazy" // Add native lazy loading for performance

        // copy link to clipboard on click
        element.addEventListener("click", async (e) => {
            try {
                await navigator.clipboard.writeText(element.src);

                const rect = element.getBoundingClientRect();
                const left = rect.left + (rect.width / 2) + window.scrollX
                const top = rect.top + window.scrollY

                tooltip.style.top = `${top}px`
                tooltip.style.left = `${left}px`
                tooltip.classList.add("show")
                
                clearTimeout(tooltipTimeout)
                tooltipTimeout = setTimeout(() => {
                    tooltip.classList.remove("show")
                }, 1500)
            } catch (err) {
                console.error("Failed to copy gif:", err);
            }
        })

        result_count++
        gif_container.appendChild(element)
    }

    count.results.innerHTML = `Showing ${result_count} of ${all_results.length} results`

    if (result_count == all_results.length) {
        button_load_more.style.display = "none"
    }
    else {
        button_load_more.style.display = "block"
    }

    console.log(`dom element count: ${gif_container.children.length}`)
}

function handle_theme(toggle = false) {
    let preferred = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')).matches;
    let theme = ""

    if (toggle) {
        if (theme = localStorage.getItem("theme")) {
            theme = theme == "dark" ? "light" : "dark"
        }
        else {
            theme = preferred ? "light" : "dark"
        }
    }
    else {
        if (theme = localStorage.getItem("theme")) {
            // Keep existing theme
        }
        else {
            theme = preferred ? "dark" : "light"
        }
    }

    localStorage.setItem("theme", theme)
    document.documentElement.dataset.theme = theme
    theme_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="0 -960 960 960">${theme_icons[theme]}</svg>`
}

/**
 * Get all flag values
 * @returns Object with boolean flag values
 */
function handle_flags() {
    return {
        nsfw: handle_flag("nsfw", input_nsfw),
        racist: handle_flag("racist", input_racist),
        gore: handle_flag("gore", input_gore)
    }
}

/**
 * Get flag value from local storage and handle checkbox value 
 * @param {*} name Name of the flag
 * @param {*} checkbox_element DOM checkbox element corresponding to the flag
 * @returns Boolean flag value
 */
function handle_flag(name, checkbox_element) {
    if (localStorage.getItem(name) == null) {
        localStorage.setItem(name, false)
        checkbox_element.checked = false
        return false
    }

    let value = localStorage.getItem(name) == "true" ? true : false
    checkbox_element.checked = value
    return value
}

function get_gif_count() {
    let data = [];
    try {
        data = JSON.parse(DATA)
    } catch (e) {
        console.warn("Could not parse DATA variable.");
        return null
    }

    let nsfw = 0, racist = 0, gore = 0
    data.forEach((gif) => {
        if (gif.nsfw == true)
            nsfw++
        if (gif.racist == true)
            racist++
        if (gif.gore == true)
            gore++
    })

    input_search.placeholder = `Search through ${data.length} gifs...`
    count.nsfw.innerHTML = nsfw
    count.racist.innerHTML = racist
    count.gore.innerHTML = gore

    return {
        total: data.length,
        nsfw: nsfw,
        racist: racist,
        gore: gore
    }
}

/* Event listeners */
input_search.addEventListener("input", () => search_gifs(input_search.value, handle_flags()))

input_nsfw.addEventListener("change", (e) => {
    let checked = e.currentTarget.checked
    localStorage.setItem("nsfw", checked)
    search_gifs(input_search.value, handle_flags())
})

input_racist.addEventListener("change", (e) => {
    let checked = e.currentTarget.checked
    localStorage.setItem("racist", checked)
    search_gifs(input_search.value, handle_flags())
})

input_gore.addEventListener("change", (e) => {
    let checked = e.currentTarget.checked
    localStorage.setItem("gore", checked)
    search_gifs(input_search.value, handle_flags())
})

theme_button.addEventListener("click", () => handle_theme(true))

button_load_more.addEventListener("click", () => {
    load_count++
    display_gifs()
})

// auto focus to input
window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
        input_search.value = ""
        input_search.focus()
        search_gifs("", handle_flags())
    }

    if (
        (e.key.charCodeAt(0) >= 48 && e.key.charCodeAt(0) <= 57) ||
        (e.key.charCodeAt(0) >= 65 && e.key.charCodeAt(0) <= 90) ||
        (e.key.charCodeAt(0) >= 97 && e.key.charCodeAt(0) <= 122)
    ) {
        if (document.activeElement !== input_search) {
            input_search.focus()
        }
    }
})
