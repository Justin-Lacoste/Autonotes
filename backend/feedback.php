<?php
    if (empty($_REQUEST["email"])) {
        $return['status'] = '400';
        $return['message'] = 'Missing required information';
        echo json_encode($return);
        return;
    }
    $host = '---';
    $user = '---';
    $pass = '---';
    $db_name = '---';
    
    $db = mysqli_connect($host, $user, $pass, $db_name) or die('Unable to connect');
    
    $user_id = mysqli_real_escape_string($db, $_REQUEST['email']);
    $feedback = file_get_contents("php://input");

        
        $sql = ("INSERT INTO feedback SET user_id=?, feedback=?");
        $statement = $db->prepare($sql);
        if (!$statement) {
            throw new Exception($statement->error);
        }
        $statement->bind_param('is', $user_id, $feedback);
        $result = $statement->execute();
        if ($result) {
            $return["status"] = "200";
            $return["message"] = "Feedback sent";
        }   else {
            $return["status"] = "400";
            $return["message"] = "Could not upload feedback";
        }

    echo json_encode($return);
    return;    
    mysqli_close($db);
?>