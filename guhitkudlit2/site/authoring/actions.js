import { action } from "../lib/mobx.js";

export function createActions({
  appState,
  createGlyph,
  createNode,
  createEdge,
}) {
  const addGlyph = action(() => {
    const glyph = createGlyph();
    appState.glyphs.push(glyph);
    return glyph;
  });

  const duplicateGlyph = action((glyph) => {
    const dup = createGlyph();
    dup.nodes.replace(glyph.nodes.map(node => createNode(node)));
    dup.edges.replace(glyph.edges.map(edge => createEdge(edge.id, edge.nodes)));
    appState.glyphs.push(dup);
    return dup;
  });

  const deleteGlyph = action((glyph) => {
    appState.glyphs.replace(appState.glyphs.filter((g) => g !== glyph));
    if (appState.selectedGlyph === glyph) {
      deselectAll();
      appState.selectedGlyph = null;
    }
  });

  const selectGlyph = action((glyphOrName) => {
    deselectAll();
    if (typeof glyphOrName === "string") {
      appState.selectedGlyph = appState.glyphs.find(
        (glyph) => glyph.name === glyphOrName
      );
    } else {
      appState.selectedGlyph = appState.glyphs.find(
        (glyph) => glyph === glyphOrName
      );
    }
  });

  const addNode = action(() => {
    if (!appState.selectedGlyph) return;
    const { nodes } = appState.selectedGlyph;

    let x = 100;
    let y = 100;
    while (nodes.some((node) => node.x === x && node.y === y)) {
      x += 25;
      y += 25;
    }

    let id = 0;
    while (nodes.some((node) => node.id === id)) {
      id++;
    }

    const addedNode = createNode({
      id,
      x,
      y,
      controlX: x + 50,
      controlY: y,
      width: 100,
    });
    nodes.push(addedNode);
    selectItems([id], nodes);
    return addedNode;
  });

  const connectNodes = action(() => {
    if (!appState.selectedGlyph) return;
    const { nodes, edges } = appState.selectedGlyph;

    const selectedIDs = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    if (selectedIDs.length !== 2) {
      alert("Select exactly 2 nodes to connect!");
      return;
    }

    const connectedEdges = selectedIDs.map((nodeID) =>
      findConectedEdges(nodeID, edges)
    );

    if (connectedEdges[0].length > 1 || connectedEdges[1].length > 1) {
      alert("Cannot create forks!");
      return;
    }

    if (connectedEdges[0].some((edge) => connectedEdges[1].includes(edge))) {
      alert("Already connected!");
      return;
    }

    let id = 0;
    while (edges.some((edge) => edge.id === id)) {
      id++;
    }

    const edge = createEdge(id, selectedIDs);
    edges.push(edge);
    return edge;
  });

  const deleteSelected = action(() => {
    if (!appState.selectedGlyph) return;
    const { nodes, edges } = appState.selectedGlyph;
    nodes.replace(nodes.filter((node) => !node.selected));
    edges.replace(edges.filter((edge) => !edge.selected));
  });

  const selectItems = action((ids, inCollection, additive) => {
    if (!appState.selectedGlyph) return;
    const { nodes, edges } = appState.selectedGlyph;

    if (!additive) {
      edges.forEach((edge) => (edge.selected = false));
      nodes.forEach((node) => (node.selected = false));
    }
    inCollection.forEach((item) => {
      const selected = ids.includes(item.id);
      if (additive) {
        item.selected = item.selected !== selected;
      } else if (item.selected !== selected) {
        item.selected = selected;
      }
    });
  });

  const deselectAll = action(() => {
    if (!appState.selectedGlyph) return;
    const { nodes, edges } = appState.selectedGlyph;
    nodes.forEach((node) => (node.selected = false));
    edges.forEach((edge) => (edge.selected = false));
  });

  return {
    addGlyph,
    duplicateGlyph,
    deleteGlyph,
    selectGlyph,
    addNode,
    connectNodes,
    deleteSelected,
    selectItems,
    deselectAll,
  };
}

function findConectedEdges(nodeID, edges) {
  return edges.filter(
    (edge) => edge.nodes[0] === nodeID || edge.nodes[1] === nodeID
  );
}
