class HTMLEditor {
  constructor() {
    this.currentFile = "index.html"
    this.currentEditor = "html"
    this.files = {
      "index.html":
        '<!DOCTYPE html>\n<html lang="ja">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Page</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>これはサンプルページです。</p>\n    <script src="script.js"></script>\n</body>\n</html>',
      "style.css":
        "body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}\n\np {\n    color: #666;\n    line-height: 1.6;\n}",
      "script.js":
        'console.log("Hello from JavaScript!");\n\n// ページが読み込まれた時の処理\ndocument.addEventListener("DOMContentLoaded", function() {\n    console.log("ページが読み込まれました");\n});',
    }
    this.editor = null
    this.selectedElement = null

    this.init()
  }

  init() {
    this.setupMonacoEditor()
    this.setupEventListeners()
    this.updatePreview()
    this.updateElementTree()
  }

  setupMonacoEditor() {
    require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" } })
    require(["vs/editor/editor.main"], (monaco) => {
      this.editor = monaco.editor.create(document.getElementById("editor"), {
        value: this.files[this.currentFile],
        language: this.getLanguageFromFile(this.currentFile),
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
      })

      this.editor.onDidChangeModelContent(() => {
        this.files[this.currentFile] = this.editor.getValue()
        if (this.currentFile === "index.html") {
          this.updateElementTree()
        }
        this.updatePreview()
      })
    })
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchSidebarTab(e.target.dataset.tab)
      })
    })

    // Editor tabs
    document.querySelectorAll(".editor-area .tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchEditorTab(e.target.dataset.editor)
      })
    })

    // File selection
    document.querySelectorAll(".file-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.selectFile(e.currentTarget.dataset.file)
      })
    })

    // Device buttons
    document.querySelectorAll(".device-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchDevice(e.target.dataset.device)
      })
    })

    // Custom size inputs
    document.getElementById("customWidth").addEventListener("input", () => {
      this.updateCustomSize()
    })
    document.getElementById("customHeight").addEventListener("input", () => {
      this.updateCustomSize()
    })

    // CSS Visual Editor
    this.setupCSSEditor()

    // Run button
    document.getElementById("runBtn").addEventListener("click", () => {
      this.updatePreview()
    })

    // Save button
    document.getElementById("saveBtn").addEventListener("click", () => {
      this.saveFiles()
    })
  }

  setupCSSEditor() {
    const bgColor = document.getElementById("bgColor")
    const textColor = document.getElementById("textColor")
    const fontSize = document.getElementById("fontSize")
    const fontSizeValue = document.getElementById("fontSizeValue")
    const margin = document.getElementById("margin")
    const padding = document.getElementById("padding")

    fontSize.addEventListener("input", () => {
      fontSizeValue.textContent = fontSize.value + "px"
      this.applyCSSProperty("font-size", fontSize.value + "px")
    })

    bgColor.addEventListener("change", () => {
      this.applyCSSProperty("background-color", bgColor.value)
    })

    textColor.addEventListener("change", () => {
      this.applyCSSProperty("color", textColor.value)
    })

    margin.addEventListener("input", () => {
      this.applyCSSProperty("margin", margin.value + "px")
    })

    padding.addEventListener("input", () => {
      this.applyCSSProperty("padding", padding.value + "px")
    })
  }

  applyCSSProperty(property, value) {
    if (this.selectedElement) {
      // Apply to selected element
      const selector = this.selectedElement
      let css = this.files["style.css"]

      // Simple CSS property injection (basic implementation)
      const rule = `${selector} {\n    ${property}: ${value};\n}`
      css += "\n\n" + rule

      this.files["style.css"] = css
      if (this.currentFile === "style.css" && this.editor) {
        this.editor.setValue(css)
      }
      this.updatePreview()
    }
  }

  switchSidebarTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")
    document.getElementById(`${tabName}-tab`).classList.add("active")
  }

  switchEditorTab(editorType) {
    this.currentEditor = editorType

    document.querySelectorAll(".editor-area .tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelector(`[data-editor="${editorType}"]`).classList.add("active")

    // Switch file based on editor type
    const fileMap = {
      html: "index.html",
      css: "style.css",
      js: "script.js",
    }

    this.selectFile(fileMap[editorType])
  }

  selectFile(fileName) {
    this.currentFile = fileName

    document.querySelectorAll(".file-item").forEach((item) => item.classList.remove("active"))
    document.querySelector(`[data-file="${fileName}"]`).classList.add("active")

    if (this.editor) {
      this.editor.setValue(this.files[fileName])
      monaco.editor.setModelLanguage(this.editor.getModel(), this.getLanguageFromFile(fileName))
    }
  }

  getLanguageFromFile(fileName) {
    const ext = fileName.split(".").pop()
    const langMap = {
      html: "html",
      css: "css",
      js: "javascript",
    }
    return langMap[ext] || "plaintext"
  }

  switchDevice(device) {
    document.querySelectorAll(".device-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelector(`[data-device="${device}"]`).classList.add("active")

    const preview = document.getElementById("preview")
    const customSize = document.getElementById("customSize")

    preview.className = `preview-frame ${device}`

    if (device === "custom") {
      customSize.style.display = "flex"
      this.updateCustomSize()
    } else {
      customSize.style.display = "none"
    }
  }

  updateCustomSize() {
    const width = document.getElementById("customWidth").value
    const height = document.getElementById("customHeight").value
    const preview = document.getElementById("preview")

    if (width && height) {
      preview.style.width = width + "px"
      preview.style.height = height + "px"
    }
  }

  updatePreview() {
    const preview = document.getElementById("preview")
    const htmlContent = this.files["index.html"]
    const cssContent = this.files["style.css"]
    const jsContent = this.files["script.js"]

    const fullHTML = htmlContent
      .replace('<link rel="stylesheet" href="style.css">', `<style>${cssContent}</style>`)
      .replace('<script src="script.js"></script>', `<script>${jsContent}</script>`)

    const blob = new Blob([fullHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    preview.src = url

    // Clean up previous URL
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  updateElementTree() {
    const treeContainer = document.getElementById("elementTree")
    const htmlContent = this.files["index.html"]

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, "text/html")
      const tree = this.buildElementTree(doc.documentElement, 0)
      treeContainer.innerHTML = tree

      // Add click listeners to tree items
      treeContainer.querySelectorAll(".tree-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation()
          this.selectElement(item.dataset.selector)
        })
      })
    } catch (error) {
      treeContainer.innerHTML = '<div class="tree-item">HTML解析エラー</div>'
    }
  }

  buildElementTree(element, depth) {
    if (element.nodeType !== Node.ELEMENT_NODE) return ""

    const indent = '<span class="tree-indent"></span>'.repeat(depth)
    const tagName = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ""
    const classes = element.className ? `.${element.className.split(" ").join(".")}` : ""
    return (
      indent +
      `<div class="tree-item" data-selector="${tagName}${id}${classes}">
            &lt;${tagName}&gt;
        </div>` +
      Array.from(element.children)
        .map((child) => this.buildElementTree(child, depth + 1))
        .join("")
    )
  }

  selectElement(selector) {
    this.selectedElement = selector
    document.querySelectorAll(".tree-item").forEach((item) => item.classList.remove("selected"))
    document.querySelector(`[data-selector="${selector}"]`).classList.add("selected")
  }

  saveFiles() {
    const dataStr = JSON.stringify(this.files, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = "project.json"
    link.click()

    URL.revokeObjectURL(url)
  }
}

// Initialize the editor when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new HTMLEditor()
})
