<?php

// Find link to object page
$document = new DOMDocument;
$document->validateOnParse = true;
@$document->loadHTML(file_get_contents("http://62.88.129.39/carlotta/web/"));

$links = $document->getElementsByTagName("a");
for ($a = 0; $a < $links->length; $a++) {
    if ($links->item($a)->getAttribute("title") == "Senast registrerade föremål") {
        $url = "http://62.88.129.39/carlotta/web/".$links->item($a)->getAttribute("href");
        $document = new DOMDocument;
        $document->validateOnParse = true;
        @$document->loadHTML(file_get_contents($url));
        break;
    }
}

// Find link to full size image
$links = $document->getElementsByTagName("a");
for ($a = 0; $a < $links->length; $a++) {
    if (substr($links->item($a)->getAttribute("href"), 0, 11) == "image/zoom/") {
        echo("http://62.88.129.39/carlotta/web/".$links->item($a)->getAttribute("href"));
        break;
    }
}

?>