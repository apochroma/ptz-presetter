<?php

if (isset($_GET['ip'])) {
	$ip = $_GET['ip'];
	$octet = explode(".", $_GET['ip']);
	//echo $octet[3];
	//exit();
}

// Delete Preset
if (isset($_GET['delete'])) {
	$deleteurl = 'http://'. $ip .'/-wvhttp-01-/preset/set?&p=' . $_GET['delete'] . '&name=&ptz=disabled';
	unlink($octet[3].'/preset'.$_GET['delete'].'.jpg');
	file_get_contents($deleteurl);
}

// Call prestored Presets
if (isset($_GET['call'])) {
	//echo "Variable 'call' is set.<br>";
	$callurl = 'http://'. $ip .'/-wvhttp-01-/control.cgi?p='. $_GET['call'];
	file_get_contents($callurl);
}

// Strore Presets
if (isset($_GET['preset'])) {
	//echo "Variable 'preset' is set.<br>";
	$preset = "preset" . $_GET['preset'];
	//echo $preset;
	//exit();
	// Remote image URL
	
	// URL for saving image
	$url = 'http://'. $ip .'/-wvhttp-01-/image.cgi';
	// URL for setting preset
	$preseturl = 'http://'. $ip .'/-wvhttp-01-/preset/set?&p=' . $_GET['preset'] . '&name='. $preset .'&all=enabled';
	
	// Image path
	$img = $octet[3] . '/' . $preset . '.jpg';
	
	// Save image 
	file_put_contents($img, file_get_contents($url));
	#bis hierhin funktioniert es
	file_get_contents($preseturl);
}

header("Refresh:0.1; url=index.php");

?>



