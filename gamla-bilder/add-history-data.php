<?php
if ($_GET["url"] != "") {
    $data = file_get_contents("history-data.txt");
    $data .= $_GET["url"]."\n";
    file_put_contents("history-data.txt", $data);
}
?>