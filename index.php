<?php
// set expires header
header('Expires: Thu, 1 Jan 1970 00:00:00 GMT');

// set cache-control header
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0',false);

// set pragma header
header('Pragma: no-cache');

$ipcam1="10.10.10.100";
$ipcam2="10.10.10.101";
$ipcam3="10.10.10.102";


function getIndexActivePreset($address) {
	$result=file_get_contents('http://'. $address .'/-wvhttp-01-/info.cgi?item=p');
	$presetArray = explode(PHP_EOL, $result);
	return substr($presetArray[2], -1);
}

// --> $showme="http://10.10.10.100/-wvhttp-01-/info.cgi?item=p";
// --> $result=file_get_contents($showme); 

//build an array of all the key=>value pairs, we are interested in the last used/set preset, that is array index 2
// --> $presetArray = explode(PHP_EOL, $result);
//echo $arr[2];
//echo substr($arr[2], -1);

// --> $index=substr($presetArray[2], -1);


echo '<html>
<head>
	
	<style>
		body {
		  background-color: black;
		}
		h1 {
		  color: #cdcdcd;
		}
		.grid-container {
		  padding: 15px;
		  --s:180px; /* controls the size */
		  --g:5px; /* controls the gap */

		  display: grid;
  		  gap: var(--g);
  		  width: calc(5*var(--s) + 4*var(--g)); /* 5 times the size plus 4 times the gap */
  		  grid-template-columns: repeat(5, auto);

		}
				
		img.presets {
		  width: 180px;
		  min-width: 100%;
		  object-fit: cover;
		}

		a {
			position: relative;
			color: red;
			font-size: 14px;
			text-decoration: none;
		}

		.icons {
			height: 24px;
			width: 24x;
		}

		p {
			margin: 0;
			color: white;
		}

		.center {
			text-align: center;
		}

		.camsection {
			margin-top: 5px;
			float: left;
			border-style: solid;
			border-color: white;
		}
		span > a > img {
			width: 24px;
			height: 24px;
		}

		.big-grid {
			display: grid;
			grid-template-columns: 0.07fr 1fr;
		}
		.title {
			margin: auto;
			display: block;
			transform: rotate(-90deg);
		}

		#102a1 {
			border: red 2px solid;
			background-color: cornflowerblue;
		}

		.active {
			background-color: cornflowerblue;
		}

	</style>
</head>
<body>

<div class="camsection">
	<div class="big-grid">
		<div class="big-grid title">
			<h1>Cam 1</h1>
		</div>
	
		<div class="big-grid content">
			<div class="grid-container">';
			$index=getIndexActivePreset($ipcam1);
			$n=1;
			$ip=$ipcam1; $octet = explode(".", $ipcam1);
			while($n<=10){
				if (file_exists($octet[3].'/preset'.$n.'.jpg')) {
					$imgurl=$octet[3].'/preset'.$n.'.jpg';
				} else {
					$imgurl='images/empty.jpg';
				}
				if ($n == $index) {
					echo '
				<div class="active">';
				} else {
					echo '
				<div>';
				}
			echo "\n\t\t\t\t\t".'<a href="getimage.php?ip='. $ip .'&call='.$n.'"><img src="'.$imgurl.'" class="presets" /></a>
					<span style="float: left; padding-left: 15px;"><a href="getimage.php?ip='. $ip .'&preset='.$n.'"><img src="images/baseline_save_white_24dp.png"/></a>
					<a href="getimage.php?ip='. $ip .'&delete='.$n.'"><img src="images/outline_delete_white_24dp.png"/></a>
					</span>
					<span style="float: right; padding-right: 15px;"><a href="getimage.php?ip='. $ip .'&call='.$n.'"><img src="images/baseline_play_arrow_white_24dp.png"/></a></span>
					<p class="center">Preset'.$n.'</p>
				</div>';    
			$n++;    
			}
			echo '
			</div>
		</div>
	</div>
</div>

<div class="camsection">
	<div class="big-grid">
		<div class="big-grid title">
			<h1>Cam 2</h1>
		</div>
	
		<div class="big-grid content">
			<div class="grid-container">';
			$index=getIndexActivePreset($ipcam2);
			$n=1;
			$ip=$ipcam2; $octet = explode(".", $ipcam2);
			while($n<=10){
				if (file_exists($octet[3].'/preset'.$n.'.jpg')) {
					$imgurl=$octet[3].'/preset'.$n.'.jpg';
				} else {
					$imgurl='images/empty.jpg';
				}
				if ($n == $index) {
					echo '
				<div class="active">';
				} else {
					echo '
				<div>';
				}
			echo "\n\t\t\t\t\t".'<a href="getimage.php?ip='. $ip .'&call='.$n.'"><img src="'.$imgurl.'" class="presets" /></a>
					<span style="float: left; padding-left: 15px;"><a href="getimage.php?ip='. $ip .'&preset='.$n.'"><img src="images/baseline_save_white_24dp.png"/></a>
					<a href="getimage.php?ip='. $ip .'&delete='.$n.'"><img src="images/outline_delete_white_24dp.png"/></a></span>
					
					<span style="float: right; padding-right: 15px;"><a href="getimage.php?ip='. $ip .'&call='.$n.'"><img src="images/baseline_play_arrow_white_24dp.png"/></a></span>
					<p class="center">Preset'.$n.'</p>
				</div>';    
			$n++;    
			}
			echo '
			</div>
		</div>
	</div>
</div>

<div class="camsection">
	<div class="big-grid">
		<div class="big-grid title">
			<h1>Cam 3</h1>
		</div>
	
		<div class="big-grid content">
			<div class="grid-container">';
			$index=getIndexActivePreset($ipcam3);
			$n=1;
			$ip=$ipcam3; $octet = explode(".", $ipcam3);
			while($n<=10){
				if (file_exists($octet[3].'/preset'.$n.'.jpg')) {
					$imgurl=$octet[3].'/preset'.$n.'.jpg';
				} else {
					$imgurl='images/empty.jpg';
				}

				if ($n == $index) {
					echo '
				<div class="active">';
				} else {
					echo '
				<div>';
				}
			echo "\n\t\t\t\t\t".'<a href="getimage.php?ip='. $ip .'&call='.$n.'"><img src="'.$imgurl.'" class="presets" /></a>
					<span style="float: left; padding-left: 15px;"><a href="getimage.php?ip='. $ip .'&preset='.$n.'"><img src="images/baseline_save_white_24dp.png"/></a>
					<a href="getimage.php?ip='. $ip .'&delete='.$n.'"><img src="images/outline_delete_white_24dp.png"/></a></span>
					
					<span style="float: right; padding-right: 15px;"><a href="getimage.php?ip='. $ip .'&call='.$n.'"><img src="images/baseline_play_arrow_white_24dp.png"/></a></span>
					<p class="center">Preset'.$n.'</p>
				</div>';    
			$n++;    
			}
			echo '
			</div>
		</div>
	</div>
</div>

</body>'
?>