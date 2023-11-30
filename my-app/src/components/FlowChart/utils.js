// 计算节点的层级信息
function calculateLevels(nodes) {
    const levels = {};
    const queue = [];

    // 添加所有没有父节点的节点到队列中
    for (const node of nodes) {
        if (!node.parentIds || node.parentIds.length === 0) {
            queue.push(node);
            levels[node.id] = 0;
        }
    }

    // BFS 遍历节点树，计算每个节点的层级
    while (queue.length > 0) {
        const node = queue.shift();
        const level = levels[node.id];

        for (const parentId of node.parentIds) {
            const parentLevel = levels[parentId] ?? -1;

            if (level <= parentLevel) {
                levels[parentId] = level - 1;
                queue.push(nodes.find(n => n.id === parentId));
            }
        }
    }

    return levels;
}

// 拓扑排序节点列表
function sortNodesByLevel(nodes, levels) {
    const sortedNodes = [...nodes];

    sortedNodes.sort((a, b) => levels[a.id] - levels[b.id]);

    return sortedNodes;
}

// 计算节点在二维平面上的坐标
function calculateCoordinates(nodes, levels) {
    const nodeWidth = 100; // 节点宽度
    const nodeHeight = 50; // 节点高度
    const marginX = 50; // x 方向间距
    const marginY = 50; // y 方向间距
    const coordinates = {};

    // 遍历每个层级，计算节点 x 和 y 坐标
    for (const level of new Set(Object.values(levels))) {
        const nodesAtLevel = nodes.filter(n => levels[n.id] === level);
        const count = nodesAtLevel.length;

        // 计算该层所有节点的总宽度
        const totalWidth = count * nodeWidth + (count - 1) * marginX;
        // 计算第一个节点 x 坐标
        const startX = (800 - totalWidth) / 2;

        for (let i = 0; i < count; i++) {
            const node = nodesAtLevel[i];
            const x = startX + i * (nodeWidth + marginX);
            const y = level * (nodeHeight + marginY);
            coordinates[node.id] = { x, y };
        }
    }

    return coordinates;
}

// 更新节点的坐标信息
function updateNodeCoordinates(nodes, coordinates) {
    for (const node of nodes) {
        const { x, y } = coordinates[node.id];
        node.x = x;
        node.y = y;
    }
}

// 处理节点数据，计算坐标
export function processData(nodes) {
    const levels = calculateLevels(nodes);
    const sortedNodes = sortNodesByLevel(nodes, levels);
    const coordinates = calculateCoordinates(sortedNodes, levels);
    updateNodeCoordinates(nodes, coordinates);
}