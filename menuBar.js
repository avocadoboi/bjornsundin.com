document.head.innerHTML += `
<meta name="keywords" content="Björn Sundin, programming, music production, game development, coding, games, c++, c#, SFML, javascript">
<meta name="description" content="I'm Björn Sundin! I program stuff and make games and music.">
<meta charset="utf-8">

<style>
    body {
        margin: 0;
        background-color: white;
        text-align: center;
    }
    a {
        transition: 0.3s;
        text-decoration: none;
        color: #00bcd4;
    }
    a:hover {
        color: #f06292;
    }
    .menuItems {
        margin: 0px;
        transition: 0.3s;
        font-size: 53px;
        color: #00bcd4;
    }
    .menuItems:hover {
        color: #f06292;
    }
</style>`;

document.body.innerHTML += `
    <div style="white-space: nowrap; text-align: center;">
        <a href="../info/index.html" style="display: inline-block; margin-top: 30px; color: #f06292;"><h1 style="font-size: 100px; margin: 0px;">Björn Sundin</h1></a>
    </div>
    <div style="white-space: nowrap; text-align: center; margin-top: 10px; margin-bottom: 60px;">
        <a href="../projects/index.html" style="display: inline-block;"><h3 class="menuItems">PROJECTS</h2></a>
        <a href="../index.html" style="display: inline-block; margin-left: 30px;"><h3 class="menuItems">INFO</h2></a>
    </div>
`;

function addCenteredLink(text, href, fontSize = "30px", className = ""){
    var container = document.createElement("div");
    container.style.textAlign = "center";
    document.body.appendChild(container);
    
    var link = document.createElement("a");
    link.style.display = "inline-block";
    link.innerHTML = text;
    link.href = href;
    link.className = className;
    link.style.fontSize = fontSize;
    container.appendChild(link);
}