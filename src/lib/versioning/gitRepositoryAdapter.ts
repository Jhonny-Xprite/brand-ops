import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'

import simpleGit, { type SimpleGit } from 'simple-git'

const DEFAULT_GITIGNORE = ['.sync-metadata/', '.sync-locks/']

export class GitRepositoryAdapter {
  private git: SimpleGit

  constructor(private readonly storageRoot: string) {
    this.git = simpleGit({
      baseDir: storageRoot,
      binary: 'git',
      maxConcurrentProcesses: 1,
    })
  }

  getStorageRoot(): string {
    return this.storageRoot
  }

  async ensureRepositoryReady(): Promise<void> {
    if (!fs.existsSync(this.storageRoot)) {
      fs.mkdirSync(this.storageRoot, { recursive: true })
    }

    if (!fs.existsSync(path.join(this.storageRoot, '.git'))) {
      await this.git.init()
      await this.git.addConfig('user.name', 'Brand Ops Local')
      await this.git.addConfig('user.email', 'brand-ops@local.invalid')
      this.ensureGitignore()
    }
  }

  hasIndexLock(): boolean {
    return fs.existsSync(path.join(this.storageRoot, '.git', 'index.lock'))
  }

  hasRepository(): boolean {
    return fs.existsSync(path.join(this.storageRoot, '.git'))
  }

  async stageFile(filePath: string): Promise<void> {
    const relativePath = this.toRepoRelativePath(filePath)
    await this.git.add(relativePath)
  }

  async commit(message: string, allowEmpty = false): Promise<string> {
    if (allowEmpty) {
      await this.git.raw(['commit', '--allow-empty', '-m', message])
    } else {
      await this.git.commit(message)
    }

    return this.git.revparse(['HEAD'])
  }

  readFileAtCommit(commitHash: string, filePath: string): Buffer {
    const relativePath = this.toRepoRelativePath(filePath).split(path.sep).join('/')

    try {
      return execFileSync('git', ['show', `${commitHash}:${relativePath}`], {
        cwd: this.storageRoot,
        encoding: 'buffer',
        maxBuffer: 20 * 1024 * 1024,
      })
    } catch {
      throw new Error('GIT-004')
    }
  }

  private toRepoRelativePath(filePath: string): string {
    const normalizedRoot = path.resolve(this.storageRoot)
    const normalizedFilePath = path.resolve(filePath)

    if (!normalizedFilePath.startsWith(normalizedRoot)) {
      throw new Error('GIT-001')
    }

    return path.relative(normalizedRoot, normalizedFilePath)
  }

  private ensureGitignore(): void {
    const gitignorePath = path.join(this.storageRoot, '.gitignore')

    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, `${DEFAULT_GITIGNORE.join('\n')}\n`, 'utf8')
      return
    }

    const current = fs.readFileSync(gitignorePath, 'utf8')
    const missingEntries = DEFAULT_GITIGNORE.filter((entry) => !current.includes(entry))

    if (missingEntries.length > 0) {
      fs.appendFileSync(gitignorePath, `${missingEntries.join('\n')}\n`, 'utf8')
    }
  }
}
