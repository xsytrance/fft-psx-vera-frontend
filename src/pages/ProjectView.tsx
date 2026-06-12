import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import type { Project, Character, SaveTruth, PromptInspectorResult, EquipmentTruthTestResult } from '../types';

export default function ProjectView() {
  const { id } = useParams();
  const { state } = useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [saveTruth, setSaveTruth] = useState<SaveTruth | null>(null);
  const [saveTruthError, setSaveTruthError] = useState<string | null>(null);
  const [promptInspector, setPromptInspector] = useState<PromptInspectorResult | null>(null);
  const [truthTest, setTruthTest] = useState<EquipmentTruthTestResult | null>(null);
  const [qaLoading, setQaLoading] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  useEffect(() => {
    const p = state.projects.find(p => p.id === Number(id));
    if (p) {
      setProject(p);
    } else {
      fetch(`/api/projects/${id}`)
        .then(r => r.json())
        .then(data => setProject(data))
        .catch(() => {});
    }
  }, [id, state.projects]);

  useEffect(() => {
    if (!id) return;
    setSaveTruthError(null);
    fetch(`/api/projects/${id}/save-truth`)
      .then(r => {
        if (!r.ok) throw new Error(`Save truth unavailable (${r.status})`);
        return r.json();
      })
      .then(data => setSaveTruth(data))
      .catch(err => setSaveTruthError(err instanceof Error ? err.message : 'Save truth unavailable'));
  }, [id]);

  const auditedCharacters = useMemo(
    () => saveTruth?.characters.filter(char => char.has_equipment) ?? [],
    [saveTruth]
  );

  const normalizeName = (value: string | null | undefined) =>
    (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const findRosterCharacter = (saveName: string) => {
    const target = normalizeName(saveName);
    return (project?.characters || []).find(char => normalizeName(char.name) === target)
      || (project?.characters || []).find(char => {
        const roster = normalizeName(char.name);
        return Boolean(roster && target && (roster.includes(target) || target.includes(roster)));
      });
  };

  const inspectPrompt = async (saveName: string) => {
    const rosterChar = findRosterCharacter(saveName);
    if (!project || !rosterChar) {
      setQaError(`No chat character found for ${saveName}`);
      return;
    }
    setQaError(null);
    setQaLoading(`inspect-${saveName}`);
    try {
      const res = await fetch(`/api/projects/${project.id}/characters/${rosterChar.id}/prompt-inspector`);
      if (!res.ok) throw new Error(`Prompt inspector failed (${res.status})`);
      setPromptInspector(await res.json());
    } catch (err) {
      setQaError(err instanceof Error ? err.message : 'Prompt inspector failed');
    } finally {
      setQaLoading(null);
    }
  };

  const runGearTruthTest = async (saveName: string) => {
    const rosterChar = findRosterCharacter(saveName);
    if (!project || !rosterChar) {
      setQaError(`No chat character found for ${saveName}`);
      return;
    }
    setQaError(null);
    setQaLoading(`test-${saveName}`);
    try {
      const res = await fetch(`/api/projects/${project.id}/characters/${rosterChar.id}/equipment-truth-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What do I have equipped right now? Answer with only my equipped item names.' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Gear QA failed (${res.status})`);
      }
      setTruthTest(await res.json());
    } catch (err) {
      setQaError(err instanceof Error ? err.message : 'Gear QA failed');
    } finally {
      setQaLoading(null);
    }
  };

  if (!project) {
    return <div className="page-loading">Loading...</div>;
  }

  const characters: Character[] = project.characters || [];

  return (
    <div className="page-project">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/dashboard">Projects</Link> / <span>{project.name}</span>
        </div>
        <h1>{project.name}</h1>
        <p className="phase">{project.story_phase}</p>
      </div>

      <div className="quick-actions">
        {characters.length >= 2 && (
          <Link to={`/project/${project.id}/group-chat`} className="btn-group-chat">
            🗺️ Council Chat
            <span className="btn-subtitle">Talk to multiple characters at once</span>
          </Link>
        )}

        <Link to={`/project/${project.id}/inventory`} className="btn-inventory">
          🎒 Current Inventory
          <span className="btn-subtitle">View parsed save-file gear and items</span>
        </Link>

        <Link to={`/project/${project.id}/campfire`} className="btn-inventory">
          🔥 Campfire
          <span className="btn-subtitle">Discuss latest save memory with the party</span>
        </Link>
      </div>

      <section className="save-truth-audit">
        <div className="audit-header">
          <div>
            <span className="audit-eyebrow">SAVE TRUTH AUDIT</span>
            <h2>What the AI knows from this memory card</h2>
            <p>These are the hard facts injected before character personality or lore.</p>
          </div>
          {saveTruth && (
            <div className="audit-score">
              <strong>{saveTruth.characters_with_equipment}</strong>
              <span>with confirmed gear</span>
            </div>
          )}
        </div>

        {saveTruthError && <p className="audit-error">{saveTruthError}</p>}
        {!saveTruth && !saveTruthError && <p className="empty-text">Reading save truth...</p>}

        {saveTruth && (
          <>
            <div className="audit-stat-grid">
              <div><span>Schema</span><strong>{saveTruth.schema_version || 'missing'}</strong></div>
              <div>
                <span>Validation</span>
                <strong className={saveTruth.validation.valid ? 'audit-pass-text' : 'audit-fail-text'}>
                  {saveTruth.validation.valid ? 'VALID' : 'INVALID'}
                </strong>
              </div>
              <div><span>Characters</span><strong>{saveTruth.character_count}</strong></div>
              <div><span>Inventory</span><strong>{saveTruth.inventory_count}</strong></div>
              <div><span>Gil</span><strong>{saveTruth.gold}</strong></div>
            </div>

            {(saveTruth.validation.errors.length > 0 || saveTruth.validation.warnings.length > 0) && (
              <div className="audit-validation-panel">
                {saveTruth.validation.errors.length > 0 && (
                  <div>
                    <strong>Schema errors</strong>
                    <ul>{saveTruth.validation.errors.map(error => <li key={error}>{error}</li>)}</ul>
                  </div>
                )}
                {saveTruth.validation.warnings.length > 0 && (
                  <div>
                    <strong>Schema warnings</strong>
                    <ul>{saveTruth.validation.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            <details className="save-truth-json">
              <summary>Show normalized SaveTruth JSON</summary>
              <pre>{JSON.stringify(saveTruth.save_truth, null, 2)}</pre>
            </details>

            {auditedCharacters.length === 0 ? (
              <p className="audit-warning">No confirmed equipment is stored for this project yet. Characters must not guess gear.</p>
            ) : (
              <div className="audit-character-grid">
                {auditedCharacters.map(char => (
                  <div className="audit-char-card" key={`${char.slot}-${char.name}`}>
                    <div className="audit-char-topline">
                      <h3>{char.name}</h3>
                      <span>Lv.{char.level} {char.job}</span>
                    </div>
                    <div className="audit-equipment-list">
                      {char.equipment.map(item => (
                        <div className="audit-equipment-row" key={`${char.slot}-${item.slot}`}>
                          <span>{item.slot.replaceAll('_', ' ')}</span>
                          <strong>{item.item_name}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="audit-qa-actions">
                      <button
                        type="button"
                        onClick={() => inspectPrompt(char.name)}
                        disabled={qaLoading !== null}
                      >
                        {qaLoading === `inspect-${char.name}` ? 'Inspecting...' : 'Inspect Prompt'}
                      </button>
                      <button
                        type="button"
                        onClick={() => runGearTruthTest(char.name)}
                        disabled={qaLoading !== null}
                      >
                        {qaLoading === `test-${char.name}` ? 'Testing...' : 'Run Gear QA'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(qaError || promptInspector || truthTest) && (
              <div className="audit-qa-panel">
                <div className="audit-qa-panel-header">
                  <span>LIVE CHAT QA</span>
                  <button type="button" onClick={() => { setPromptInspector(null); setTruthTest(null); setQaError(null); }}>Clear</button>
                </div>

                {qaError && <p className="audit-error">{qaError}</p>}

                {promptInspector && (
                  <div className="prompt-inspector-result">
                    <h3>Prompt Inspector: {promptInspector.character_name}</h3>
                    <div className="audit-stat-grid compact">
                      <div><span>Actual Gear Header</span><strong>{promptInspector.prompt_contains_actual_equipment_header ? 'YES' : 'NO'}</strong></div>
                      <div><span>Expected Items</span><strong>{promptInspector.equipment_truth.expected_item_names.length}</strong></div>
                    </div>
                    <div className="prompt-item-checks">
                      {Object.entries(promptInspector.prompt_contains_expected_items).map(([item, present]) => (
                        <span key={item} className={present ? 'pass' : 'fail'}>{present ? '✓' : '✗'} {item}</span>
                      ))}
                    </div>
                    <details>
                      <summary>Show exact system prompt</summary>
                      <pre>{promptInspector.system_prompt}</pre>
                    </details>
                  </div>
                )}

                {truthTest && (
                  <div className={`gear-test-result ${truthTest.score.pass ? 'pass' : 'fail'}`}>
                    <h3>{truthTest.score.pass ? 'PASS' : 'FAIL'} — {truthTest.character_name} gear answer</h3>
                    <p><strong>Expected:</strong> {truthTest.equipment_truth.expected_item_names.join(', ')}</p>
                    <p><strong>Model said:</strong> {truthTest.response || '(empty)'}</p>
                    {truthTest.score.missing_items.length > 0 && (
                      <p><strong>Missing:</strong> {truthTest.score.missing_items.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <section className="roster">
        <h2>Party Roster</h2>
        {characters.length === 0 ? (
          <p className="empty-text">No characters detected in this save.</p>
        ) : (
          <div className="character-grid">
            {characters.map(char => (
              <Link
                key={char.id}
                to={`/project/${project.id}/character/${char.id}`}
                className="char-card"
              >
                <div className="char-card-avatar">
                  {char.avatar_url ? (
                    <img src={char.avatar_url} alt={char.name} />
                  ) : (
                    <div className="avatar-placeholder">{char.name[0]}</div>
                  )}
                </div>
                <div className="char-card-info">
                  <h3>{char.name}</h3>
                  <p>{char.role || 'Party Member'}</p>
                  {char.level > 0 && <span className="char-level">Lv.{char.level}</span>}
                </div>
                <div className="char-card-arrow">{"\u2192"}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
