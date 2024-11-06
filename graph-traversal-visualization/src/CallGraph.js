// src/CallGraph.js
import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import debounce from 'lodash.debounce';
import { IconContext } from 'react-icons';
import { AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineExport } from 'react-icons/ai';
import { FaRandom } from 'react-icons/fa';
import { CgShortcut } from 'react-icons/cg';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { BsFolderPlus } from 'react-icons/bs';

// Import Material UI components
import {
  AppBar, Toolbar, Button, IconButton, TextField, Box, Typography,
  Container, Grid, Paper, Stack
} from '@mui/material';

import './App.css';  // Ensure CSS import is at the bottom, if following best practices


const CallGraph = ({ data, columnSelections }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [centralityResults, setCentralityResults] = useState({});

  const initializeCytoscape = (elements) => {
    if (!containerRef.current) {
      console.error("Cytoscape container is not available.");
      return;
    }

    if (cyRef.current) {
      cyRef.current.destroy(); // Ensure previous instances are cleaned up
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#0074D9',
            label: 'data(label)',
            color: 'blue',
            'text-valign': 'center',
            'text-halign': 'center',
            width: '60px',
            height: '60px',
            'border-width': '2px',
            'border-color': '#FFFFFF',
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#FF4136',
            'target-arrow-color': '#FF4136',
            'target-arrow-shape': 'triangle',
          },
        },
        {
          selector: '.highlighted-node',
          style: {
            'background-color': '#FFD700', // Gold color for highlighted nodes
            'border-color': '#FFD700',
            'border-width': '4px',
          },
        },
        {
          selector: '.highlighted-edge',
          style: {
            'line-color': '#00FF00', // Green color for highlighted edges
            'width': '4px', // Thicker line for highlighted edges
          },
        },
        {
          selector: '.tap-node',
          style: {
            'background-color': '#FFD700', // For example, a gold color for TAP nodes
            'border-color': '#FF4136',
            'border-width': '4px',
          },
        },
        
      ],
      
      layout: { name: 'cose' }, // Force-directed layout
    });

    cyRef.current.zoom(zoomLevel);
  };

  const debouncedUpdate = debounce((elements) => {
    initializeCytoscape(elements);
  }, 300);

  useEffect(() => {
    if (!data || !columnSelections || !columnSelections.source || !columnSelections.target) {
      console.warn("No valid data or columns selected for visualization.");
      return;
    }

    const sourceColumn = columnSelections.source;
    const targetColumn = columnSelections.target;
    const elements = [];

    data.forEach((record) => {
      if (record[sourceColumn] && record[targetColumn]) {
        const sourceId = record[sourceColumn];
        const targetId = record[targetColumn];

        if (!elements.some((el) => el.data.id === sourceId)) {
          elements.push({ data: { id: sourceId, label: sourceId } });
        }
        if (!elements.some((el) => el.data.id === targetId)) {
          elements.push({ data: { id: targetId, label: targetId } });
        }

        elements.push({ data: { source: sourceId, target: targetId } });
      }
    });

    debouncedUpdate(elements);
  }, [data, columnSelections]);



  const zoomIn = () => {
    if (cyRef.current) {
      const newZoomLevel = zoomLevel + 0.2;
      setZoomLevel(newZoomLevel);
      cyRef.current.zoom(newZoomLevel);
    }
  };



  const zoomOut = () => {
    if (cyRef.current) {
      const newZoomLevel = Math.max(0.2, zoomLevel - 0.2);
      setZoomLevel(newZoomLevel);
      cyRef.current.zoom(newZoomLevel);
    }
  };



  const resetVisitedNodes = () => {
    if (cyRef.current) {
        cyRef.current.nodes().forEach(node => {
            node.removeClass('visited-node'); // Remove the highlight class
        });
    }
};

const highlightEdge = (edge) => {
    edge.addClass('visited-edge'); // Add a class to highlight edges
};


const handleBFS = () => {
  resetVisitedNodes(); // Clear previous highlights
  if (cyRef.current) {
    const startNode = cyRef.current.nodes()[0]; // Start from the first node
    const queue = [startNode];
    const visited = new Set();
    visited.add(startNode.id());

    const traverse = () => {
      if (queue.length === 0) return; // Exit if no nodes left to visit

      const currentNode = queue.shift();
      currentNode.addClass('visited-node'); // Highlight visited nodes

      // Highlight edges connected to current node
      currentNode.neighborhood().edges().forEach((edge) => {
        edge.addClass('highlighted-edge'); // Highlight edges
      });

      currentNode.neighborhood().nodes().forEach((neighbor) => {
        if (!visited.has(neighbor.id())) {
          visited.add(neighbor.id());
          queue.push(neighbor);
        }
      });

      // Use a timeout to create a visual delay
      setTimeout(traverse, 500); // Adjust the delay as needed
    };

    traverse(); // Start the traversal
  }
};



const handleDFS = () => {
  resetVisitedNodes(); // Clear previous highlights
  if (cyRef.current) {
    const startNode = cyRef.current.nodes()[0]; // Start from the first node
    const visited = new Set();

    const traverse = (node) => {
      if (visited.has(node.id())) return; // Exit if already visited

      visited.add(node.id());
      node.addClass('visited-node'); // Highlight the node

      // Highlight edges connected to current node
      node.neighborhood().edges().forEach((edge) => {
        edge.addClass('highlighted-edge'); // Highlight edges
      });

      // Recursive call for each unvisited neighbor
      node.neighborhood().nodes().forEach((neighbor) => {
        traverse(neighbor);
      });

      // Delay to visualize traversal
      setTimeout(() => {}, 500); // Adjust the delay as needed
    };

    traverse(startNode); // Start the traversal
  }
};



const handleTAP = () => {
  if (cyRef.current) {
    const nodes = cyRef.current.nodes();
    nodes.removeClass('tap-node'); // Clear previous TAP node highlights
    const taps = nodes.filter(node => node.degree() > 2); // Select nodes with more than 2 connections

    // Log the TAP nodes
    console.log("TAP nodes found:", taps.map(n => n.id()));

    if (taps.length > 0) {
      taps.addClass('tap-node'); // Highlighting the TAP nodes
    } else {
      console.log("No TAP nodes found");
    }
  }
};



  const handleFrequencyCluster = () => {
    if (cyRef.current) {
        const edges = cyRef.current.edges();
        const frequencyMap = {};

        // Create a frequency map of connections
        edges.forEach(edge => {
            const sourceId = edge.source().id();
            const targetId = edge.target().id();
            frequencyMap[sourceId] = (frequencyMap[sourceId] || 0) + 1;
            frequencyMap[targetId] = (frequencyMap[targetId] || 0) + 1;
        });

        // Log the frequency of each node
        console.log("Frequency of connections per node:", frequencyMap);

        // Determine a threshold for clustering (this can be adjusted based on your data)
        const frequencies = Object.values(frequencyMap);
        const maxFrequency = Math.max(...frequencies);
        const threshold = maxFrequency / 2; // Adjust as necessary

        // Visualize nodes based on frequency clustering
        cyRef.current.nodes().forEach(node => {
            const frequency = frequencyMap[node.id()] || 0;
            if (frequency > threshold) {
                node.addClass('high-frequency-node'); // Add a class for high-frequency nodes
            } else {
                node.removeClass('high-frequency-node'); // Ensure other nodes are reset
            }
        });

        // Optional: Color high-frequency nodes differently
        cyRef.current.nodes().forEach(node => {
            if (node.hasClass('high-frequency-node')) {
                node.style({
                    'background-color': '#FF851B', // Example color for high-frequency nodes
                    'border-color': '#FF4136',
                });
            } else {
                node.style({
                    'background-color': '#0074D9', // Default color
                    'border-color': '#FFFFFF',
                });
            }
        });

        console.log("Frequency clustering completed.");
    } else {
        console.error("Cytoscape instance not initialized.");
    }
};



const handleDistanceCalculation = () => {
  const fromNodeInput = document.getElementById('fromNodeId');
  const toNodeInput = document.getElementById('toNodeId');

  // Check if the input fields exist
  if (!fromNodeInput || !toNodeInput) {
    alert('Please provide valid node IDs.');
    return;
  }

  const fromNode = fromNodeInput.value.trim();
  const toNode = toNodeInput.value.trim();

  if (!fromNode || !toNode || !cyRef.current) {
    alert('Please provide valid node IDs and ensure the graph is initialized.');
    return;
  }

  // Check if the nodes exist in the graph
  const fromNodeElement = cyRef.current.$(`#${fromNode}`);
  const toNodeElement = cyRef.current.$(`#${toNode}`);

  if (fromNodeElement.length === 0) {
    alert(`Node ${fromNode} not found in the graph.`);
    return;
  }
  
  if (toNodeElement.length === 0) {
    alert(`Node ${toNode} not found in the graph.`);
    return;
  }

  // Find the shortest path using Dijkstra's algorithm
  const dijkstra = cyRef.current.elements().dijkstra(fromNodeElement, (edge) => 1);  // Unweighted graph, so edge weight is 1
  const path = dijkstra.pathTo(toNodeElement);

  // Clear previous highlights
  cyRef.current.elements().removeClass('highlighted-node highlighted-edge');

  if (path.length === 0) {
    alert('No path found between the specified nodes.');
  } else {
    // Calculate the number of edges in the path (this is the distance in an unweighted graph)
    const edgesInPath = path.filter(ele => ele.isEdge());
    const distance = edgesInPath.length;

    // Highlight the nodes and edges in the path
    path.forEach(ele => {
      if (ele.isNode()) {
        ele.addClass('highlighted-node'); // Add a class to highlight nodes
      } else if (ele.isEdge()) {
        ele.addClass('highlighted-edge'); // Add a class to highlight edges
      }
    });

    alert(`Shortest distance between ${fromNode} and ${toNode} is ${distance} edges.`);
  }
};



  
const handleCentrality = () => {
  if (cyRef.current) {
    const nodes = cyRef.current.nodes();

    // Calculate betweenness centrality using Cytoscape.js's built-in method
    const betweennessCentrality = cyRef.current.elements().betweennessCentrality();

    nodes.forEach((node) => {
      const centralityValue = betweennessCentrality.betweennessNormalized(node);  // Get normalized betweenness centrality for each node

      // Store centrality in node data
      node.data('centrality', centralityValue);

      // Update node styles based on centrality value
      const newSize = 40 + centralityValue * 100;  // Adjust node size based on centrality
      node.style({
        width: `${newSize}px`,
        height: `${newSize}px`,
        'background-color': `rgba(255, 0, 0, ${centralityValue})`,  // Color intensity based on centrality
      });
    });

    console.log("Centrality calculated for all nodes.");
  } else {
    console.error("Cytoscape instance not initialized.");
  }
};

    

    // Export functionality
    const handleExport = () => {
      if (cyRef.current) {
        const elements = cyRef.current.elements();
        const csvData = [];
  
        elements.forEach((element) => {
          if (element.isNode()) {
            csvData.push({ id: element.id(), label: element.data('label') });
          } else if (element.isEdge()) {
            csvData.push({ source: element.source().id(), target: element.target().id() });
          }
        });
  
        // Convert the data to CSV format
        const csvContent = `data:text/csv;charset=utf-8,` + 
          csvData.map(e => e.source ? `${e.source},${e.target}` : `${e.id},${e.label}`).join('\n');
  
        // Create a link element to trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'graph_data.csv');
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file
        document.body.removeChild(link); // Cleanup
      }
    };
  

    // Import functionality
    const handleImport = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv';
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target.result;
            const data = parseCSV(text);
            initializeCytoscape(data);
          };
          reader.readAsText(file);
        }
      };
      fileInput.click(); // Programmatically click to open file dialog
    };
  

    // Function to parse CSV and convert it to a format suitable for Cytoscape
    const parseCSV = (text) => {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const nodes = new Set();
      const edges = [];
  
      lines.forEach((line, index) => {
        const [source, target] = line.split(',');
        if (source && target) {
          nodes.add(source.trim());
          nodes.add(target.trim());
          edges.push({ data: { source: source.trim(), target: target.trim() } });
        }
      });
  
      // Create node elements
      const elements = Array.from(nodes).map(node => ({
        data: { id: node, label: node }
      })).concat(edges);
  
      return elements; // Return the Cytoscape elements
    };
  
    
    return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Call Graph Visualization
          </Typography>

          <TextField
  label="From"
  id="fromNodeId" // Add this
  variant="outlined"
  size="small"
  value={fromNode}
  onChange={(e) => setFromNode(e.target.value)}
  sx={{ mr: 2 }}
/>

<TextField
  label="To"
  id="toNodeId" // Add this
  variant="outlined"
  size="small"
  value={toNode}
  onChange={(e) => setToNode(e.target.value)}
  sx={{ mr: 2 }}
/>

        
          <Button variant="contained" color="primary" onClick={() => handleDistanceCalculation()}>
            Calculate Distance
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>
        {/* Control Buttons Above Graph */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="center">
          <Button variant="contained" color="success" onClick={() => handleBFS()}>
            BFS
          </Button>
          <Button variant="contained" color="info" onClick={() => handleDFS()}>
            DFS
          </Button>
          <Button variant="contained" color="warning" onClick={() => handleTAP()}>
            <CgShortcut /> TAP
          </Button>
          <Button variant="contained" color="error" onClick={() => handleFrequencyCluster()}>
            <FaRandom /> Frequency Cluster
          </Button>
          <Button variant="contained" color="primary" onClick={() => handleCentrality()}>
            Centrality
          </Button>
          <Button variant="contained" color="secondary" onClick={zoomOut}>
            <AiOutlineZoomOut /> Zoom Out
          </Button>
          <Button variant="contained" color="secondary" onClick={zoomIn}>
            <AiOutlineZoomIn /> Zoom In
          </Button>
          <Button variant="contained" color="error" onClick={() => cyRef.current?.destroy()}>
            <VscDebugDisconnect /> Clear
          </Button>
          <Button variant="contained" color="success" onClick={handleExport}>
            <AiOutlineExport /> Export
          </Button>
          <Button variant="contained" color="secondary" onClick={handleImport}>
            <BsFolderPlus /> Import
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                {/* Cytoscape Container */}
                <div ref={containerRef} style={{ width: '100%', height: '600px' }}></div>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CallGraph;