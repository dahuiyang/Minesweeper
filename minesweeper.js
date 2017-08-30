window.onload = function () {
    var startBtn = document.getElementById('start_btn');
    var gameWapper = document.getElementsByClassName('game_wapper')[0];
    var mapWidthE = document.getElementById('map_width');
    var mapHeightE = document.getElementById('map_height');
    var mineNumE = document.getElementById('mine_num');
    var newMap;

    startBtn.onclick = function () {
        gameStart();
    }
    function gameStart() {
        clearNodes(gameWapper);
        var mapWidth = parseInt(mapWidthE.value);
        var mapHeight = parseInt(mapHeightE.value);
        var mineNum = parseInt(mineNumE.value);
        if (mineNum > mapWidth * mapHeight) {
            mineNum = mapWidth * mapHeight;
        }
        newMap = mapGenerator(mapWidth, mapHeight, mineNum);
        var tableE = document.createElement('table');
        for (var i = 0; i < newMap.length; i++) {
            var trE = document.createElement('tr');
            for (var j = 0; j < newMap[0].length; j++) {
                let tdE = document.createElement('td');
                tdE.classList.add('td_' + i + '_' + j);
                trE.appendChild(tdE);
            }
            tableE.appendChild(trE);
            tableE.onclick = tbClickHandller;
        }
        gameWapper.appendChild(tableE);
    }

    function refreshTable(map) {
        var tds = document.getElementsByTagName('td');
        for (var i = 0; i < tds.length; i++) {
            tdp = tds[i].classList[0].split('_');
            tdp.splice(0, 1);
            tdp = [parseInt(tdp[0]), parseInt(tdp[1])];
            var tdV = pointToValue(tdp, map);
            if (tdV >= 10) {
                tds[i].innerHTML = tdV - 10;
            }

            if (tdV === '雷') {
                tds[i].style.color='red';
                tds[i].innerHTML = '雷';
            }
        }

    }


    function tbClickHandller(e) {
        if (e.target.localName === 'td') {
            var c = e.target.classList[0].split('_');
            var p = [parseInt(c[1]), parseInt(c[2])];
            if (!dig(p, newMap)) {
                showMines(newMap);
            }
            refreshTable(newMap);
        }
    }
}

function showMines(map) {
    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[0].length; j++) {
            if (pointToValue([i, j], map) === 1) {
                map[i][j] = '雷';
            }
        }
    }
}

//清空nodes
function clearNodes(parent) {
    var num;
    var i = num = parent.childNodes.length;
    for (i; i > 0; i--) {
        parent.removeChild(parent.childNodes[i - 1]);
    }
}

/**
 *  取得坐标的值  
 * @param {[number,number]} point
 * @param {[][]} map
 */
function pointToValue(point, map) {
    return map[point[0]] ? map[point[0]][point[1]] : undefined;
}
/**
 * 计算point周围的地雷数量 0为空
 * @param {[number,number]} point
 * @param {[][]} map
 * @return {number}
 */
function getPointNumber(point, map) {
    var points = getNearbyPoints(point, map);
    var result = 0;
    points.forEach(function (e) {
        if (pointToValue(e, map) === 1) {
            result++;
        }
    })
    return result;
}
/**
 * 返回point周围的8个坐标
 * @param {number} point 
 * @param {[][]} map 
 * @return [[x,y]]
 */
function getNearbyPoints(point, map) {

    var xl = map.length, yl = map[0].length;
    var x = point[0], y = point[1];
    var result = [];
    [[x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x, y - 1], [x, y + 1], [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]]
        .forEach(function (e) {
            if ((e[0] >= 0 && e[0] <= xl - 1) &&
                (e[1] >= 0 && e[1] <= yl - 1)) {
                result.push(e);
            }
        })

    return result;
}
/**
 * 
 * @param {[number,number]} point 
 * @param {[][]]} map 
 * @return  
 */
function dig(point, map) {
    if (map[0][0] === 9) { return }
    var result;
    var pValue = pointToValue(point, map);
    //挖到雷 boom!
    if (pValue === 1) {
        map[0][0] = 9;
        alert('boom!')
        return false;
    }
    //为空 计算周围的地雷数量
    if (!pValue) {
        //周围地雷的数量
        var mineNum = getPointNumber(point, map);
        //if (num === undefined) return console.log('出错了');
        //如果周围并没有雷
        if (mineNum === 0) {
            autoDig(point, map);
        } else {
            setPointValue(point, mineNum, map);
        }
    }
    return true;
}
/**
 * 
 * @param {number} point 
 * @param {number} value 
 * @param {[][]} map 
 */
function setPointValue(point, value, map) {
    map[point[0]][point[1]] = value + 10;
}
/**
 * 自动挖空白块
 * @param {number} point 
 * @param {[][]} map 
 */
function autoDig(point, map) {
    setPointValue(point, 0, map);
    var points = getNearbyPoints(point, map);
    var blankPoints = [];
    points.forEach(function (e) {
        if (!pointToValue(e, map)) {
            var mineNum = getPointNumber(e, map);
            if (mineNum === 0) {
                blankPoints.push(e);
            } else {
                setPointValue(e, mineNum, map);
            }
        }
    })
    if (blankPoints.length !== 0) {
        blankPoints.forEach(function (e) {
            autoDig(e, map);
        })
    }
}

/**
 * 生成扫雷地图
 * @param {number} x 
 * @param {number} y 
 * @param {number} mines 
 * @return {[][]} map
 * [x][y]
 * undefined -->空
 * 1----------->雷
 * 2----------->标记雷
 * 9  gameover
 * 10 已挖 空
 * 11      1
 * 12      2
 * ...
 * 18      8
 */
function mapGenerator(y, x, mines) {
    let map = new Array(x);
    for (var i = 0; i < map.length; i++) {
        map[i] = new Array(y);
    }

    while (mines) {
        //获取随机坐标
        var point = getRandomPoint(x - 1, y - 1);
        //设置地雷标记
        if (!map[point.x] || !map[point.x][point.y]) {
            map[point.x][point.y] = 1;
            mines--;
        }
    }

    return map;
}
/**
 * 生成随机数
 * @param {numbet} Min 
 * @param {number} Max 
 * @return {number}
 */
function getRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}
/**
 * 生成随机坐标
 * @param {number} x 
 * @param {number} y
 * @return {object} 
 */
function getRandomPoint(x, y) {
    return {
        x: getRandomNum(0, x),
        y: getRandomNum(0, y)
    };
}