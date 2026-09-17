# Fake ERP

Classroom ERP for traders/contractors: a master catalog of materials, then quantity in a warehouse and purchase.

## Language

**Item**:
A material or input that is bought and stocked. It exists in the catalog even with no quantity.
_Avoid_: Product, produto, catalog item (as an entity)

**Catalog**:
The master list of Items. It has no balance.
_Avoid_: Catálogo, estoque, inventory, warehouse

**SKU**:
A stable, unique code in the catalog that identifies an Item. It does not change when quantity changes.
_Avoid_: internal id as a business identifier

**Unit**:
How an Item is counted (bag, meter, piece). In this slice, text on the Item itself.
_Avoid_: Unidade, UoM as an entity, unit of measure table

**Warehouse**:
The depot where a quantity of an Item lives. Quantity belongs here, not on the Item.
_Avoid_: stock on the Item, stock in the catalog

**Stock**:
The quantity of one Item in one Warehouse. An Item can have Stock in more than one Warehouse.
_Avoid_: inventory on the Item, balance on the Catalog, estoque

**User**:
A person who signs in. Not Staff.
_Avoid_: account, usuário, login (as an entity)

**Role**:
Administrator or Operator. A User has one Role.
_Avoid_: permission, perfil, group

**Job**:
The work site. Not a Warehouse. Quantity does not belong here.
_Avoid_: obra, canteiro, project, site, Warehouse (as this place)

**Staff**:
A person who can be allocated to a Job. Not a User. Exists with no Assignment.
_Avoid_: employee, usuário, User (as this person)

**Assignment**:
Staff tied to one Job for a period. It does not write Stock. The Job does not hold Staff.
_Avoid_: alocação, roster, hours

**Movement**:
A Receipt, Transfer, or Issue that writes Stock quantity. Nothing else writes Stock.
_Avoid_: movimento, stock write by hand

**Supplier**:
Who supplies an Item. Identified by a unique name.
_Avoid_: vendor, fornecedor, company

**Purchase**:
An order for one Item, one quantity, one Warehouse, from one Supplier. It does not write Stock.
_Avoid_: pedido, order, Receipt (as this order)

**Receipt**:
Quantity of an Item entering a Warehouse.
_Avoid_: recebimento, entrada, Purchase (as this Movement)

**Transfer**:
Quantity of an Item moving from one Warehouse to another.
_Avoid_: transferência, move between Jobs

**Issue**:
Quantity of an Item leaving a Warehouse for a Job. The Job does not hold that quantity.
_Avoid_: baixa, saída, quantity on the Job
