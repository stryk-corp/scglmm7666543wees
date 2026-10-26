import { GrammarDefinition, SectionNode, SectionRole } from './types';

export interface GrammarViolation {
  nodeId: string;
  message: string;
}

export function getAllowedParentRoles(
  sections: SectionNode[],
): Partial<Record<SectionRole, readonly (SectionRole | null)[]>> {
  const parents: Partial<Record<SectionRole, Array<SectionRole | null>>> = {};

  function visit(node: SectionNode, parentRole: SectionRole | null): void {
    const allowed = parents[node.role] ?? [];
    if (!allowed.includes(parentRole)) {
      allowed.push(parentRole);
    }
    parents[node.role] = allowed;
    node.children.forEach((child) => visit(child, node.role));
  }

  sections.forEach((node) => visit(node, null));
  return parents;
}

export function validateGrammarTree(grammar: GrammarDefinition): GrammarViolation[] {
  const violations: GrammarViolation[] = [];
  const ids = new Set<string>();

  function visit(node: SectionNode, parentRole: SectionRole | null): void {
    if (ids.has(node.id)) {
      violations.push({ nodeId: node.id, message: 'Section IDs must be unique within a grammar.' });
    }
    ids.add(node.id);

    if (!grammar.validRoles.has(node.role)) {
      violations.push({ nodeId: node.id, message: `Role "${node.role}" is not allowed in ${grammar.documentType}.` });
    }

    const allowedParents = grammar.allowedParents[node.role];
    if (!allowedParents?.includes(parentRole ?? null)) {
      violations.push({
        nodeId: node.id,
        message: `Role "${node.role}" is not allowed under parent "${parentRole ?? 'document'}".`,
      });
    }

    if (node.isContainer && node.children.length === 0) {
      violations.push({ nodeId: node.id, message: 'A structural container must have children.' });
    }
    if (!node.isContainer && node.children.length > 0) {
      violations.push({ nodeId: node.id, message: 'A writable section cannot contain child sections.' });
    }

    const orders = node.children.map((child) => child.order);
    if (new Set(orders).size !== orders.length) {
      violations.push({ nodeId: node.id, message: 'Sibling order values must be unique.' });
    }
    node.children.forEach((child) => visit(child, node.role));
  }

  const rootOrders = grammar.sections.map((node) => node.order);
  if (new Set(rootOrders).size !== rootOrders.length) {
    violations.push({ nodeId: 'document', message: 'Root section order values must be unique.' });
  }
  grammar.sections.forEach((node) => visit(node, null));
  return violations;
}

export function containsGrammarNode(grammar: GrammarDefinition, nodeId: string): boolean {
  function visit(node: SectionNode): boolean {
    return node.id === nodeId || node.children.some(visit);
  }
  return grammar.sections.some(visit);
}
