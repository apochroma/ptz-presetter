<?php
$preset = "preset" . $_GET['preset'];

if (isset($_GET['call'])) {
	echo "Variable 'call' is set.<br>";
	$callurl = 'http://10.10.10.100/-wvhttp-01-/control.cgi?p='. $_GET['call'];
	file_get_contents($callurl);
}

if (isset($_GET['preset'])) {
	echo "Variable 'preset' is set.<br>";
	//echo $preset;
	//exit();
	// Remote image URL
	
	// URL for saving image
	$url = 'http://10.10.10.100/-wvhttp-01-/image.cgi';
	// URL for setting preset
	$preseturl = 'http://10.10.10.100/-wvhttp-01-/preset/set?&p=' . $_GET['preset'] . '&name='. $preset .'&all=enabled';
	
	// Image path
	$img = $preset . '.jpg';
	
	// Save image 
	file_put_contents($img, file_get_contents($url));
	#bis hierhin funktioniert es
	file_get_contents($preseturl);
}

header("Refresh:0.1; url=index.php");

?>



