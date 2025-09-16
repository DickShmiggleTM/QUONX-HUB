import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { FileNode, GraphNode, GraphLink } from '../types';

interface KnowledgeGraphProps {
  fileSystemTree: FileNode | null;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ fileSystemTree }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const { nodes, links } = useMemo(() => {
    if (!fileSystemTree) {
      return { nodes: [], links: [] };
    }

    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];

    const traverse = (node: FileNode) => {
      graphNodes.push({ id: node.path, name: node.name, type: node.type });
      if (node.children) {
        node.children.forEach(child => {
          graphLinks.push({ source: node.path, target: child.path });
          traverse(child);
        });
      }
    };

    traverse(fileSystemTree);
    return { nodes: graphNodes, links: graphLinks };
  }, [fileSystemTree]);


  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const isDarkMode = document.documentElement.classList.contains('dark');
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(70))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", isDarkMode ? "#666" : "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    node.append("circle")
      .attr("r", (d) => d.type === 'directory' ? 12 : 8)
      .attr("fill", (d) => d.type === 'directory' ? (isDarkMode ? '#3b82f6' : '#000080') : (isDarkMode ? '#2dd4bf' : '#00a0a0'));
      
    node.append("text")
      .text(d => d.name)
      .attr('x', 15)
      .attr('y', 5)
      .style("font-family", "VT323, monospace")
      .style("font-size", "16px")
      .attr("fill", isDarkMode ? "#fff" : "#000");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<GraphNode, undefined>) {
        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

  }, [nodes, links]);

  if (!fileSystemTree) {
    return (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <p className="text-black dark:text-white">Select a directory to build the knowledge graph.</p>
        </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-800">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default KnowledgeGraph;