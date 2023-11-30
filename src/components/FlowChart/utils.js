export function processData(data) {
    const { lines, nodes } = data;
    const inDeg = {};
    const nodeList = nodes.reduce((acc, t) => {
        inDeg[t.nodeId] = 0;
        acc[t.nodeId] = { ...t, neighbor: [] };
        return acc;
    }, {});
    for (const { from, to } of lines) {
        inDeg[to]++;
        nodeList[from].neighbor.push(to);
    }
    const q = Object.keys(inDeg).filter((k) => !inDeg[k])
    const formatNodes = [];
    while (q.length) {
        let size = q.length;
        let layer = [];
        while (size) {
            const cur = q.shift();
            for (const neighbor of nodeList[cur].neighbor) {
                if (!--inDeg[neighbor]) q.push(neighbor);
            }
            layer.push(nodes.find(t => t.id === cur));
            size--;
        }
        formatNodes.push(layer);
    }
    return formatNodes;
}
//1:普通节点\n2:分支节点\n3:开始节点\n4.结束节点
export function formatNodes(data) {
    const { lines, nodes } = data
    const branchNodeist = nodes.filter((t) => t.nodeType === '2');
    const startNode = nodes.find((t) => t.nodeType === '3');
    const endNode = nodes.find((t) => t.nodeType === '4');
    if (!startNode || !endNode) {
        this.$message.error('Start/End节点不存在');
        return;
    }
    const steps = nodes.filter(t => t.nodeType !== '4')
    let excute = (toLinks, res) => {
        toLinks.forEach((line) => {
            const { from, to } = line;
            const step = steps.find((t) => t.id === to);
            if (!step) {
                return;
            }
            step.prevId = from;
            const links = lines.filter((t) => t.from === to);
            if (links.length > 0) {
                step.children = []
                excute(links, step);
            }
            res.children.push(step);
        });
    };
    const res = { ...startNode, children: [] }
    const toLinks = lines.filter(t => t.from === startNode.id)
    excute(toLinks, res);
    excute = null
    return res
}