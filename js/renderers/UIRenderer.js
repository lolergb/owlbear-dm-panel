/**
 * @fileoverview Renderizador de UI para categorías y páginas
 * 
 * Genera el HTML para la navegación de categorías y páginas.
 */

import { generateColorFromString, getInitial } from '../utils/helpers.js';
import { log } from '../utils/logger.js';

/**
 * Renderizador de interfaz de usuario
 */
export class UIRenderer {
  constructor() {
    // Referencia al StorageService
    this.storageService = null;
    // Callback para cuando se hace clic en una página
    this.onPageClick = null;
    // Callback para cuando se cambia visibilidad
    this.onVisibilityChange = null;
    // Callback para editar página
    this.onPageEdit = null;
    // Callback para eliminar página
    this.onPageDelete = null;
    // Callback para añadir página
    this.onAddPage = null;
  }

  /**
   * Inyecta dependencias
   * @param {Object} deps - Dependencias
   */
  setDependencies({ storageService }) {
    if (storageService) this.storageService = storageService;
  }

  /**
   * Establece callbacks de eventos
   */
  setCallbacks({ onPageClick, onVisibilityChange, onPageEdit, onPageDelete, onAddPage }) {
    if (onPageClick) this.onPageClick = onPageClick;
    if (onVisibilityChange) this.onVisibilityChange = onVisibilityChange;
    if (onPageEdit) this.onPageEdit = onPageEdit;
    if (onPageDelete) this.onPageDelete = onPageDelete;
    if (onAddPage) this.onAddPage = onAddPage;
  }

  /**
   * Verifica si una categoría tiene contenido visible para players
   * @param {Object} category - Categoría a verificar
   * @returns {boolean}
   */
  hasVisibleContentForPlayers(category) {
    // Verificar páginas visibles en esta categoría
    if (category.pages && category.pages.some(p => p.visibleToPlayers === true)) {
      return true;
    }
    
    // Verificar subcategorías recursivamente
    if (category.categories) {
      return category.categories.some(subcat => this.hasVisibleContentForPlayers(subcat));
    }
    
    return false;
  }

  /**
   * Renderiza una categoría completa
   * @param {Object} category - Categoría a renderizar
   * @param {HTMLElement} parentElement - Elemento padre
   * @param {number} level - Nivel de anidamiento
   * @param {string} roomId - ID del room
   * @param {Array} categoryPath - Ruta de la categoría
   * @param {boolean} isGM - Si el usuario es GM
   */
  renderCategory(category, parentElement, level = 0, roomId = null, categoryPath = [], isGM = true) {
    // Si es jugador, verificar contenido visible
    if (!isGM && !this.hasVisibleContentForPlayers(category)) {
      return;
    }

    const hasPages = category.pages && category.pages.length > 0;
    const hasSubcategories = category.categories && category.categories.length > 0;

    // Filtrar páginas válidas
    let categoryPages = hasPages ? category.pages.filter(page => 
      page.url && 
      !page.url.includes('...') && 
      (page.url.startsWith('http') || page.url.startsWith('/'))
    ) : [];

    // Si es jugador, filtrar solo páginas visibles
    if (!isGM) {
      categoryPages = categoryPages.filter(page => page.visibleToPlayers === true);
    }

    if (!category.name) return;

    // Crear contenedor de categoría
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-group';
    categoryDiv.dataset.categoryName = category.name;
    categoryDiv.dataset.level = Math.min(level, 5);
    categoryDiv.dataset.categoryPath = JSON.stringify(categoryPath);

    // Crear título con botón de colapsar
    const titleContainer = this._createCategoryTitle(category, level, categoryPath, isGM);
    categoryDiv.appendChild(titleContainer);

    // Crear contenido de la categoría
    const contentDiv = document.createElement('div');
    contentDiv.className = 'category-content';

    // Verificar estado colapsado
    const collapseStateKey = `category-collapsed-${category.name}-level-${level}`;
    const isCollapsed = localStorage.getItem(collapseStateKey) === 'true';
    if (isCollapsed) {
      contentDiv.classList.add('collapsed');
      categoryDiv.classList.add('collapsed');
    }

    // Renderizar páginas
    if (categoryPages.length > 0) {
      const pagesContainer = document.createElement('div');
      pagesContainer.className = 'pages-container';

      categoryPages.forEach((page, pageIndex) => {
        const pageElement = this.renderPage(page, roomId, [...categoryPath, category.name], pageIndex, isGM);
        if (pageElement) {
          pagesContainer.appendChild(pageElement);
        }
      });

      contentDiv.appendChild(pagesContainer);
    }

    // Botón de añadir página (solo para GM)
    if (isGM) {
      const addButton = this._createAddButton([...categoryPath, category.name]);
      contentDiv.appendChild(addButton);
    }

    // Renderizar subcategorías
    if (hasSubcategories) {
      category.categories.forEach(subcat => {
        this.renderCategory(subcat, contentDiv, level + 1, roomId, [...categoryPath, category.name], isGM);
      });
    }

    categoryDiv.appendChild(contentDiv);
    parentElement.appendChild(categoryDiv);
  }

  /**
   * Renderiza una página individual
   * @param {Object} page - Página a renderizar
   * @param {string} roomId - ID del room
   * @param {Array} categoryPath - Ruta de la categoría
   * @param {number} pageIndex - Índice de la página
   * @param {boolean} isGM - Si el usuario es GM
   * @returns {HTMLElement}
   */
  renderPage(page, roomId, categoryPath, pageIndex, isGM = true) {
    const pageItem = document.createElement('div');
    pageItem.className = 'page-item';
    pageItem.dataset.categoryPath = JSON.stringify(categoryPath);
    pageItem.dataset.pageIndex = pageIndex;
    pageItem.dataset.pageName = page.name;
    pageItem.dataset.pageUrl = page.url;

    // Icono de página
    const pageIcon = this._createPageIcon(page);
    pageItem.appendChild(pageIcon);

    // Nombre de página
    const pageName = document.createElement('span');
    pageName.className = 'page-name';
    pageName.textContent = page.name;
    pageItem.appendChild(pageName);

    // Indicador de tipo de bloque (si aplica)
    if (page.blockTypes && page.blockTypes.length > 0) {
      const blockTypeIndicator = document.createElement('span');
      blockTypeIndicator.className = 'block-type-indicator';
      blockTypeIndicator.textContent = `(${page.blockTypes.join(', ')})`;
      blockTypeIndicator.title = 'Filtered blocks: ' + page.blockTypes.join(', ');
      pageItem.appendChild(blockTypeIndicator);
    }

    // Controles de página (solo GM)
    if (isGM) {
      const controls = this._createPageControls(page, categoryPath, pageIndex);
      pageItem.appendChild(controls);
    }

    // Click para abrir página
    pageItem.addEventListener('click', (e) => {
      // Ignorar clicks en controles
      if (e.target.closest('.page-controls') || e.target.closest('.icon-button')) {
        return;
      }
      if (this.onPageClick) {
        this.onPageClick(page, categoryPath, pageIndex);
      }
    });

    return pageItem;
  }

  /**
   * Renderiza todas las categorías desde config
   * @param {Object} config - Configuración del vault
   * @param {HTMLElement} container - Contenedor
   * @param {string} roomId - ID del room
   * @param {boolean} isGM - Si el usuario es GM
   */
  renderAllCategories(config, container, roomId, isGM = true) {
    container.innerHTML = '';

    if (!config || !config.categories || config.categories.length === 0) {
      container.innerHTML = '<p class="empty-message">No pages configured. Click + to add your first page.</p>';
      return;
    }

    config.categories.forEach(category => {
      this.renderCategory(category, container, 0, roomId, [], isGM);
    });
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Crea el título de una categoría con controles
   * @private
   */
  _createCategoryTitle(category, level, categoryPath, isGM) {
    const titleContainer = document.createElement('div');
    titleContainer.className = 'category-title-container';
    titleContainer.dataset.categoryPath = JSON.stringify(categoryPath);

    // Botón de colapsar
    const collapseButton = document.createElement('button');
    collapseButton.className = 'category-collapse-button';
    
    const collapseIcon = document.createElement('img');
    collapseIcon.className = 'category-collapse-icon';
    
    const collapseStateKey = `category-collapsed-${category.name}-level-${level}`;
    const isCollapsed = localStorage.getItem(collapseStateKey) === 'true';
    collapseIcon.src = isCollapsed ? 'img/folder-close.svg' : 'img/folder-open.svg';
    collapseIcon.alt = isCollapsed ? 'Expand' : 'Collapse';
    collapseButton.appendChild(collapseIcon);

    // Click para colapsar
    collapseButton.addEventListener('click', () => {
      const categoryDiv = titleContainer.parentElement;
      const contentDiv = categoryDiv.querySelector('.category-content');
      const newCollapsed = !categoryDiv.classList.contains('collapsed');
      
      categoryDiv.classList.toggle('collapsed', newCollapsed);
      contentDiv.classList.toggle('collapsed', newCollapsed);
      collapseIcon.src = newCollapsed ? 'img/folder-close.svg' : 'img/folder-open.svg';
      
      localStorage.setItem(collapseStateKey, newCollapsed);
    });

    titleContainer.appendChild(collapseButton);

    // Título
    const headingLevel = Math.min(level + 2, 6);
    const categoryTitle = document.createElement(`h${headingLevel}`);
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = category.name;
    titleContainer.appendChild(categoryTitle);

    // Botón de visibilidad (solo GM)
    if (isGM) {
      const isCategoryVisible = this.hasVisibleContentForPlayers(category);
      const visibilityButton = document.createElement('button');
      visibilityButton.className = 'category-visibility-button icon-button';
      
      const visibilityIcon = document.createElement('img');
      visibilityIcon.src = isCategoryVisible ? 'img/icon-eye-open.svg' : 'img/icon-eye-close.svg';
      visibilityIcon.className = 'icon-button-icon';
      visibilityButton.appendChild(visibilityIcon);
      visibilityButton.title = isCategoryVisible ? 'Has visible pages' : 'No visible pages';
      visibilityButton.style.opacity = isCategoryVisible ? '1' : '0';

      titleContainer.appendChild(visibilityButton);
    }

    return titleContainer;
  }

  /**
   * Crea el icono de una página
   * @private
   */
  _createPageIcon(page) {
    const pageIcon = document.createElement('span');
    pageIcon.className = 'page-icon';

    if (page.icon) {
      if (page.icon.type === 'emoji') {
        pageIcon.textContent = page.icon.emoji || '📄';
      } else if (page.icon.type === 'external' && page.icon.external?.url) {
        const iconImg = document.createElement('img');
        iconImg.src = page.icon.external.url;
        iconImg.className = 'page-icon-image';
        iconImg.onerror = () => { pageIcon.textContent = '📄'; iconImg.remove(); };
        pageIcon.appendChild(iconImg);
      }
    } else {
      // Icono generado por color
      const color = generateColorFromString(page.name);
      const initial = getInitial(page.name);
      pageIcon.style.backgroundColor = color;
      pageIcon.style.color = 'white';
      pageIcon.textContent = initial;
      pageIcon.className = 'page-icon page-icon-generated';
    }

    return pageIcon;
  }

  /**
   * Crea los controles de una página
   * @private
   */
  _createPageControls(page, categoryPath, pageIndex) {
    const controls = document.createElement('div');
    controls.className = 'page-controls';

    // Botón de visibilidad
    const visibilityButton = document.createElement('button');
    visibilityButton.className = 'icon-button visibility-button';
    visibilityButton.title = page.visibleToPlayers ? 'Visible to players (click to hide)' : 'Hidden from players (click to show)';
    
    const visibilityIcon = document.createElement('img');
    visibilityIcon.src = page.visibleToPlayers ? 'img/icon-eye-open.svg' : 'img/icon-eye-close.svg';
    visibilityIcon.className = 'icon-button-icon';
    visibilityButton.appendChild(visibilityIcon);

    visibilityButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onVisibilityChange) {
        this.onVisibilityChange(page, categoryPath, pageIndex, !page.visibleToPlayers);
      }
    });

    controls.appendChild(visibilityButton);

    // Botón de editar
    const editButton = document.createElement('button');
    editButton.className = 'icon-button edit-button';
    editButton.title = 'Edit page';
    
    const editIcon = document.createElement('img');
    editIcon.src = 'img/icon-edit.svg';
    editIcon.className = 'icon-button-icon';
    editButton.appendChild(editIcon);

    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onPageEdit) {
        this.onPageEdit(page, categoryPath, pageIndex);
      }
    });

    controls.appendChild(editButton);

    // Botón de eliminar
    const deleteButton = document.createElement('button');
    deleteButton.className = 'icon-button delete-button';
    deleteButton.title = 'Delete page';
    
    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'img/icon-delete.svg';
    deleteIcon.className = 'icon-button-icon';
    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onPageDelete) {
        this.onPageDelete(page, categoryPath, pageIndex);
      }
    });

    controls.appendChild(deleteButton);

    return controls;
  }

  /**
   * Crea el botón de añadir página
   * @private
   */
  _createAddButton(categoryPath) {
    const addButton = document.createElement('button');
    addButton.className = 'add-page-button';
    addButton.title = 'Add page to this category';
    
    const addIcon = document.createElement('img');
    addIcon.src = 'img/icon-plus.svg';
    addIcon.className = 'add-page-icon';
    addButton.appendChild(addIcon);

    const addText = document.createElement('span');
    addText.textContent = 'Add page';
    addButton.appendChild(addText);

    addButton.addEventListener('click', () => {
      if (this.onAddPage) {
        this.onAddPage(categoryPath);
      }
    });

    return addButton;
  }
}

export default UIRenderer;

