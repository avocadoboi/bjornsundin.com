<?php

// To get data from POST request:
$data_to_write = file_get_contents("php://input");

if ($data_to_write != "") {
    file_put_contents("neuralNetwork.json", $data_to_write);
}

?>